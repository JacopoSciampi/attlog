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

*******************************

General: 
    -> Add spinner when loading stuff >>>>>>>>> (WIP)

Timbrature: once FTP  | custom page with pwd
    -> Pagina API 0-25

Server: HTTPS? Mi servono in caso i due files da mettere dentro nginx + live config di KC, eccetera per girare sotto https  

FTP "per cliente", non è l'FTP ma la pagina stronza API_KEY