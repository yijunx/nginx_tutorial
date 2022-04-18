# nginx tutorial

credit to:
https://www.youtube.com/watch?v=hcw-NjOh8r0

Here i just follow the tutorial only.

## as a web server

- installation (brew install nginx)
- remove the nginx.conf in /usr/local/etc/nginx
- create nginx.conf **(make sure to update the folder path!)**

```
http {
    server {
        listen 8080;
        root /Users/yijunxu/projects/nginx_tutorial/nginx_as_web_server;

        location /images {
           root /Users/yijunxu/projects/nginx_tutorial/nginx_as_web_server;
        }

        location ~ .jpg$ {
            return 403;
        }
    }

    server {
        listen 8888;
        location / {
            proxy_pass http://localhost:8080/;

        }
    }
}

events { }
```

- run nginx by

```
nginx
```

- send a signal to nginx to stop

```
nginx -s stop
nginx -s reload
```

- In this case, user can go to
  - localhost:8080/site1
  - localhost:8080/site2
  - localhost:8080/images/tut.png
  - change port with 8888 will work also
  - any url end with .jpg will not work (403)

## as a layer 7 proxy (http)

- docker build the image with

```
cd sample_app_to_dockerize
docker build -t sample_node_app .
```

- docker run 4 images just built

```
bash start.sh
```

- proxy to 4 backend nodejs app with docker, nginx.conf:

```
http {

    upstream allbackend {

        server 127.0.0.1:2222;
        server 127.0.0.1:3333;
        server 127.0.0.1:4444;
        server 127.0.0.1:5555;
    }

    server {
        listen 80;
        location / {
            proxy_pass http://allbackend/;
        }
    }

}

events { }
```

- User can go to localhost:80, and keep refresh the page
  - will see the app is hosting by 4 backends one by one with each refresh.
- Nginx round robin the 4 backends

  - The browser establishes TCP connection with nginx.
  - Nginx establishes 4 TCP connections with the 4 backends.

- Let's use ip_hash
  - It takes the IP of the client, and hashes it.
  - One client will reach one and only one backend!
  - Allowing stateful application (which I don't like...)
  - So nothing changes after refresh

```
...
    upstream allbackend {
        ip_hash;
        server 127.0.0.1:2222;
        server 127.0.0.1:3333;
        server 127.0.0.1:4444;
        server 127.0.0.1:5555;
    }
...
```

- Let's assign 2 backends to /app1, another 2 backends to /app2
  - when accessing /app1, only 2222,3333 serve you
  - when accessing /app2, only 4444,5555 serve you

```
http {

    upstream allbackend {
        #ip_hash
        server 127.0.0.1:2222;
        server 127.0.0.1:3333;
        server 127.0.0.1:4444;
        server 127.0.0.1:5555;
    }

    upstream app1backend {
        server 127.0.0.1:2222;
        server 127.0.0.1:3333;
    }

    upstream app2backend {
        server 127.0.0.1:4444;
        server 127.0.0.1:5555;
    }

    server {
        listen 80;
        location / {
            proxy_pass http://allbackend/;
        }

        location /app1 {
            proxy_pass http://app1backend/;
        }

        location /app2 {
            proxy_pass http://app2backend/;
        }
    }

}

events { }
```

- block admin from port 80, but allows internal port like :2222/admin

```
...
    server {
        listen 80;
        location / {
            proxy_pass http://allbackend/;
        }

        location /app1 {
            proxy_pass http://app1backend/;
        }

        location /app2 {
            proxy_pass http://app2backend/;
        }

        location /admin {
            return 403;
        }
    }
...
```

## as a layer 4 proxy (tcp)

- what is a layer 4 load balancer?
  - in layer 7:
    - 1 TCP connection from browser to nginx
    - 4 TCP connections from nginx to backend
    - 5 connections in total
  - if a layer 4 proxy/load balancer is used:
    - It maps the client with backend
    - change http to stream
    - the whole thing become a layer 4
    - location cannot be used!!
    - there is no / , no http
    - it does not know what protocol it is using! (ANYTHING will work)

```
stream {

    upstream allbackend {
        server 127.0.0.1:2222;
        server 127.0.0.1:3333;
        server 127.0.0.1:4444;
        server 127.0.0.1:5555;
    }

    server {
        listen 80;
        proxy_pass allbackend;
    }
}

events { }
```

- in above example, the nginx forwards the connection request from browser to one of the backend
- thus, the page does not change after refresh.
  any future request with this TCP connection will go to that backend.
  it will not re-establish, thus it wont change. But brower may start a new one as the old one maybe used up, etc.
- let's test with telnet, it will round robin, at layer 4 level!

```
yijunxu@Yijuns-MacBook-Pro nginx % telnet 127.0.0.1 80
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
GET /

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 23
ETag: W/"17-T1mK3ZjqZlKSCaA7ccv/TGFE4ys"
Date: Mon, 15 Mar 2021 15:20:24 GMT
Connection: close

we are with APPID: 4444Connection closed by foreign host.

yijunxu@Yijuns-MacBook-Pro nginx % telnet 127.0.0.1 80
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
GET /

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 23
ETag: W/"17-T1mK3ZjqZlKSCaA7ccv/TGFE4ys"
Date: Mon, 15 Mar 2021 15:20:24 GMT
Connection: close

we are with APPID: 5555Connection closed by foreign host.
```

## https / http2 and all those stuff

- http:

  - router settings at 192.168.0.1 (based on the internet provider)
  - login
  - port forwarding to allow local ip at port 80
  - go to noip.com and ask for an address and target the ip

- https:
  - docker way
        
        sudo docker run -it --rm --name certbot \
            -v "/etc/letsencrypt:/etc/letsencrypt" \
            -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
            certbot/certbot certonly

  - not-docker-way: brew install letsencrypt
  - sudo certbot certonly --standalone
  - key in the address provided by the noip.com (and copy paste the hostname)
  - a few keys will be provided (they are links in that folder!!)
    - public key: /etc/letsencrypt/live/<hostname>/fullchain.pem
    - private key: /etc/letsencrypt/live/<hostname>/privkey.pem
    - there is also a cert.pem (this file can be used as public key to decode whatever encoded with privkey.pem, jwt.io will work. However, pyJWT will not work, pyJWT requires `openssl x509 -pubkey -noout -in cert1.pem` to produce the pubkey.pem, which can be used for decoding. before that need to find the real place of the `cert1.pem` via `ls -l`, then `cp` out, and convert it into a `pubkey.pem`)
  - nginx.conf: add `listen 443 ssl;` and ssl_cert, ssl_cert_key
    - add ssl_protocals TLSv1.3 to make it using TLS1.3 only (else TLS1.2)
    - add http2 behind `listen 443 ssl` to make it http2

  ```
  server {
      listen 80;
      listen 443 ssl http2;

      ssl_certificate /etc/letsencrypt/live/testnginx.zapto.org/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/testnginx.zapto.org/privkey.pem;

      ssl_protocols TLSv1.3;

      location / {
          proxy_pass http://allbackend/;
      }
  ...
  }

  ```
