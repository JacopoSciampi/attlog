KC: 
    Copiare il tema: 
    docker cp ./semprebon timbrature_keycloak_1:/opt/jboss/keycloak/themes/ 

http://192.168.0.161/v1/v2/api-key/<id>

*******************************

General: 
    -> Add spinner when loading stuff >>>>>>>>> (WIP)

Timbrature: once FTP  | custom page with pwd
    -> Pagina API 0-25

Server: HTTPS? Mi servono in caso i due files da mettere dentro nginx + live config di KC, eccetera per girare sotto https  

- STUFF
-> stamps -> "motivo" cambiare in "verso"
    -> aggiungi colonna causale (codice lavoro)
    -> icona aereo (verde se inviata - rosso se da inviare)

api-key/<id> -> se va in 200 -> batch update inviate

-> invio FTP ogni x secondi -> non deve prendere gli stamps associati a un API KEY
    Ftp personale (API KEY) riguarda tutti i terminali del cliente quindi se è attivo tutti i timbratori >NON inviano a ftp reale
-> fixa colonne con filtri (a b c nei filtri = a b c in colonna. Ora è a b c --- c b a)


-> tracciato FTP stuff -> T non è il SN del terminale ma ? l'id del terminale
        -> vedere se arriva "nome società" durante la GET_INFO o timbrature
        -> SE non arriva gestire a DB

Mettere i titoli nelle varie pagine (Home - Clienti - ecc)
Se possibile nella colonna N.Timbratori clic sul numero e mi apre la pagina con solo i timbratori di quel cliente.

Customers -> Nei filtri togliere email e mettere Codice Cliente

Timbrature
Ordinare le colonne nello stesso ordine dei filtri di ricerca
La colonna motivo è il codice lavoro : rinominare in causale ed ovviamente ci va quel valore