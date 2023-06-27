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
        -> add terminal modal
        -> edit row -> change infos (not the SN or state)
