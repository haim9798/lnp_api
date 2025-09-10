# lnp_api
This server will return 302 with the LNP number on an INVITE sent. 

SIP server is created based on code by Alex Nisanov using NodeJS. 

In order to load numbers to the LNP DB you need to use the REST API integrated in this LNP server. 

After deploymnet you will be able to send REST commands to http://<Your_IP>:8000/lnp/ as described below :

 1. **POST** to http://<Your_IP>:8000/lnp/ with headers 
{
number : "original number" , 
transnumb : "translated number"}

This will add or update a number in the DB. 

Curl example :

curl --header "Content-Type: application/json"   --request POST   --data '{"number":"1234","transnum":"12345"}'   http://localhost:8000/lnp

2. **GET** to http://<Your_IP>:8000/lnp/<number_to_be_translted>

This will send back a rsponse with the translated number. 
If number does not exist it will respond with error message 

Curl Example : 

curl --header "Content-Type: application/json"   --request GET   http://localhost:8000/lnp/0549709206

3. **DELETE** to http://<Your_IP>:8000/lnp/<number_to_be_translted>

This will remove the number from the LNP servers DB. 

Curl example :

curl --header "Content-Type: application/json"   --request DELETE   http://localhost:8000/lnp/0549709206
