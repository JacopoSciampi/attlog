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


Timbrature: once FTP 
    -> Aggiungi colonna "Inviata quando"
    -> Aggiungi azione "Segna come da "Inviare" (anche se già inviato)
    -> Pagina API 0-25

NodeJS -> se orologio down > 1 h invio email (once, non ogni tot, ogni giorno ecc).


Setting -> Fra le varie cose aggiungi: 
    -> set refresh automatico clocks (10,30,60s)
