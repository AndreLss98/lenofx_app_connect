#!/bin/bash

tar czf backend.tar.gz src .env package.json package-lock.json

case $1 in
"-p")
scp -i ~/.ssh/Leno-Key_Pair.pem backend.tar.gz ubuntu@lenofx-appconnect:/var/www/appconnect

ssh -i ~/.ssh/Leno-Key_Pair.pem ubuntu@lenofx-appconnect << 'ENDSSH'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /var/www/appconnect/

tar -vxf backend.tar.gz
rm backend.tar.gz
npm i

pm2 reload appconnect-service
pm2 ls
ENDSSH
;;

"-h")
scp -i ~/.ssh/Leno-Key_Pair.pem backend.tar.gz ubuntu@lenofx-appconnect:/var/www/homolog-appconnect

ssh -i ~/.ssh/Leno-Key_Pair.pem ubuntu@lenofx-appconnect << 'ENDSSH'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /var/www/homolog-appconnect/

tar -vxf backend.tar.gz
rm backend.tar.gz
npm i

pm2 reload appconnect-service-homolog
pm2 ls
ENDSSH
;;
*) echo "Please select environment (p/h)";;
esac

rm backend.tar.gz

echo "Press any key to continue"
while [ true ] ; do
read -t 3 -n 1
if [ $? = 0 ] ; then
exit ;
else
echo "waiting for the keypress"
fi
done