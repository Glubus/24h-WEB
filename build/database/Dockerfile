FROM forge-registry.iut-larochelle.fr/mariadb/mariadb-10.10.2

LABEL Maintainer="Jamal Malki <jmalki@univ-lr.fr>"
LABEL Vendor="Jamal Malki"
LABEL Description="mariadb-10.10.2"
LABEL Version="Sept-2023"

VOLUME /var/lib/mysql
EXPOSE 3306

RUN touch /var/log/mysql.log
RUN chown mysql:mysql /var/log/mysql.log
COPY ./build/database/conf/myconf.cnf /etc/mysql/conf.d/.


