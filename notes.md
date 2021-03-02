### nginx ###


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

#### as a layer 7 proxy ####

- proxy to 4 backend nodejs app with docker, start the service by

```
docker run -p 2222:9999 -e APPID=2222 -d nodeapp
```

- split the load
- block certain requests

#### as a layer 4 proxy ####