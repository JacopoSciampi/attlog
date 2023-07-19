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

- STUFF

-> export timbrature file vuoto 
-> stamps -> "motivo" cambiare in "verso"
    -> aggiungi colonna causale (codice lavoro)
    -> icona aereo (verde se inviata - rosso se da inviare)

api-key/<id> -> se va in 200 -> batch update inviate

-> invio FTP ogni x secondi -> non deve prendere gli stamps associati a un API KEY
-> fixa colonne con filtri (a b c nei filtri = a b c in colonna. Ora è a b c --- c b a)


-> tracciato FTP stuff -> T non è il SN del terminale ma ? l'id del terminale
        -> vedere se arriva "nome società" durante la GET_INFO o timbrature
        -> SE non arriva gestire a DB