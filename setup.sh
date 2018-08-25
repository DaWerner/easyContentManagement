apt-get -y install python3
apt-get -y install python3-pip
pip3 install pymongo
pip3 install flask
pip3 install flask_cors
pip3 install bson
echo Starting flask server on port 5000 and pid
python3 -u app.py </dev/null >/dev/null 2>&1 &