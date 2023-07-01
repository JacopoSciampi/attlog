DOCKER: 

PGADMIN: 
    (unix shell)
    docker ps
    docker inspect <hash> | grep IPAddress -> connect to that
    localhost/pgadmin -> login
    Create a DB called "timbrature"

KC: 
    Copiare il tema: 
    docker cp ./semprebon timbrature_keycloak_1:/opt/jboss/keycloak/themes/ 


General: 

/v1/ -> KC token
FE Cloks-> add filter for customerName / online

Relazione timbratura <-> cliente -> in timbratori aggiungi cliente (DB as relation)

Timbrature: once FTP 
    -> Aggiungi colonna "Inviata quando"
    -> Aggiungi azione "Segna come da "Inviare" (anche se già inviato)
    -> Tasto download che ti fa un txt in locale (tutte)

NodeJS -> se orologio down > 1 h invio email (once, non ogni tot, ogni giorno ecc).

