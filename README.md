### nginx tutorial ###


#### as a web server ####

- installation (brew install nginx)
- remove the nginx.conf in /usr/local/etc/nginx
- create nginx.conf

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

#### as a layer 7 proxy ####

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
- Nginx round robin the 4 backends

#### as a layer 4 proxy ####