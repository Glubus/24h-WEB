import json
import os
import re

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()

LLM_BASE_URL = os.getenv("LLM_BASE_URL")
LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL")
SYMFONY_API_URL = os.getenv("SYMFONY_API_URL", "http://nginx/api")

# Nombre maximum d'allers-retours avec le LLM (appels d'outils) avant la réponse finale.
MAX_TOOL_ITERATIONS = 5

client = OpenAI(base_url=LLM_BASE_URL or None, api_key=LLM_API_KEY or "not-needed")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    historique: str
    lastMessage: str


class ChatResponse(BaseModel):
    message_response: str
    list_annonces: list[int] = []


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_annonces",
            "description": (
                "Recherche des annonces disponibles sur la plateforme LeBon pour les "
                "recommander à l'utilisateur. Utilise cet outil dès que l'utilisateur "
                "demande un conseil d'achat ou cherche un produit."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": (
                            "Mots-clés SPÉCIFIQUES recherchés dans le titre (marque/modèle, "
                            "ex: 'iphone', 'clio'). Pour un type de produit général "
                            "(smartphone, voiture, meuble...), n'utilise PAS query mais le "
                            "paramètre category."
                        ),
                    },
                    "category": {
                        "type": "string",
                        "enum": ["car", "electronic", "sport", "home"],
                        "description": "Catégorie de l'annonce.",
                    },
                    "price_min": {
                        "type": "number",
                        "description": "Prix minimum en euros.",
                    },
                    "price_max": {
                        "type": "number",
                        "description": "Prix maximum en euros.",
                    },
                },
            },
        },
    }
]


def run_search(args: dict) -> list[dict]:
    """Interroge l'API Symfony et renvoie une liste compacte d'annonces."""
    params: list[tuple[str, str]] = [("sold", "false"), ("masked", "false")]

    query = args.get("query")
    if query:
        params.append(("title", str(query)))

    category = args.get("category")
    if category:
        params.append(("categories", str(category)))

    price_min = args.get("price_min")
    if price_min is not None:
        params.append(("price[gte]", str(price_min)))

    price_max = args.get("price_max")
    if price_max is not None:
        params.append(("price[lte]", str(price_max)))

    try:
        response = httpx.get(f"{SYMFONY_API_URL}/annonces", params=params, timeout=10.0)
        response.raise_for_status()
        data = response.json()
    except Exception as error:  # noqa: BLE001 - on renvoie l'erreur au LLM
        return [{"error": f"Recherche impossible: {error}"}]

    members = data.get("member", data.get("hydra:member", []))

    results = []
    for annonce in members[:20]:
        results.append(
            {
                "id": annonce.get("id"),
                "title": annonce.get("title"),
                "price": annonce.get("price"),
                "categories": annonce.get("categories"),
                "city": annonce.get("city"),
            }
        )

    return results


def parse_final(content: str) -> ChatResponse:
    """Extrait le JSON final {message_response, list_annonces} de la réponse du LLM."""
    text = content.strip()

    # Retire d'éventuelles fences ```json ... ```
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()

    candidate = text
    if not candidate.startswith("{"):
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            candidate = match.group(0)

    try:
        parsed = json.loads(candidate)
        message = str(parsed.get("message_response", "")).strip() or content
        raw_ids = parsed.get("list_annonces", []) or []
        ids = []
        for value in raw_ids:
            try:
                ids.append(int(value))
            except (TypeError, ValueError):
                continue
        return ChatResponse(message_response=message, list_annonces=ids)
    except (json.JSONDecodeError, AttributeError):
        return ChatResponse(message_response=content, list_annonces=[])


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    if not LLM_MODEL:
        raise HTTPException(status_code=500, detail="LLM_MODEL n'est pas configuré.")

    system_content = (
        "Tu es l'assistant de support de LeBon, une plateforme de petites annonces. "
        "Tu aides les utilisateurs à trouver des produits à acheter. "
        "Quand on te demande un conseil d'achat ou un produit, utilise l'outil "
        "search_annonces pour trouver des annonces réelles à recommander. "
        "Si une recherche ne renvoie rien, réessaie avec des critères plus larges "
        "(retire query, élargis le budget) avant de conclure qu'il n'y a rien.\n\n"
        "IMPORTANT : ta réponse FINALE doit être UNIQUEMENT un objet JSON valide, sans "
        "texte autour, au format exact suivant :\n"
        '{"message_response": "ton message en français pour l\'utilisateur", '
        '"list_annonces": [ids des annonces recommandées]}\n'
        "Mets dans list_annonces les `id` des annonces pertinentes retournées par l'outil "
        "(liste vide [] si aucune annonce pertinente)."
    )

    if payload.historique.strip():
        system_content += f"\n\nHistorique de la conversation:\n{payload.historique}"

    messages = [
        {"role": "system", "content": system_content},
        {"role": "user", "content": payload.lastMessage},
    ]

    try:
        for iteration in range(MAX_TOOL_ITERATIONS):
            # À la dernière itération, on force une réponse finale sans outils.
            use_tools = iteration < MAX_TOOL_ITERATIONS - 1
            completion = client.chat.completions.create(
                model=LLM_MODEL,
                messages=messages,
                tools=TOOLS if use_tools else None,
            )

            choice = completion.choices[0]
            message = choice.message

            if not message.tool_calls:
                return parse_final(message.content or "")

            # Rejoue le message assistant (avec ses tool_calls) puis les résultats.
            messages.append(
                {
                    "role": "assistant",
                    "content": message.content or "",
                    "tool_calls": [
                        {
                            "id": call.id,
                            "type": "function",
                            "function": {
                                "name": call.function.name,
                                "arguments": call.function.arguments,
                            },
                        }
                        for call in message.tool_calls
                    ],
                }
            )

            for call in message.tool_calls:
                try:
                    args = json.loads(call.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}

                result = run_search(args) if call.function.name == "search_annonces" else []

                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": call.id,
                        "content": json.dumps(result, ensure_ascii=False),
                    }
                )
    except Exception as error:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Erreur LLM: {error}") from error

    # Sécurité : la boucle n'a pas produit de réponse finale.
    return ChatResponse(
        message_response="Désolé, je n'ai pas réussi à formuler une réponse.",
        list_annonces=[],
    )


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
