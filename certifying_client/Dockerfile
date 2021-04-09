FROM httpd:2.4

RUN echo "\
\n\
ServerName certifying_client\n\
AddDefaultCharset utf-8\n\
LoadModule proxy_module modules/mod_proxy.so\n\
LoadModule proxy_http_module modules/mod_proxy_http.so\n\
ProxyPass /api http://server:3000\n\
ProxyPassReverse /api http://server:3000\n\
\n\
" >>/usr/local/apache2/conf/httpd.conf

ENV PATH $PATH:/sawtooth-supply-chain/bin

EXPOSE 80/tcp
