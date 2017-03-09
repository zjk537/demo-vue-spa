## 运行

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev
```


nginx 配置：

server {
     listen 80;

     server_name test.spa.com;
     root ~/www/spa/dist;
     index index.html;
     access_log /var/log/testspa.log main;

     location / {
         try_files $uri $uri/ @router;
         index index.html;
     }

    location @router {
        rewrite ^.*$ /index.html last;
    }

}