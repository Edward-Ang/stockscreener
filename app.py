from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
import os

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY') or 'fallback_secret_key'

mongo_client = MongoClient('mongodb://localhost:27017/')

host_info = mongo_client['HOST']
print ("host:", host_info)

@app.route('/')
def index():
    if 'username' in session:
        print('Current user: ' + session['username'])
    else:
        print('No user is currently logged in.')
    return render_template('index.html')

@app.route('/home')
def home():
    if 'username' in session:
        print('Current user:' + session['username'])
        return render_template('index.html')
    else:
        return redirect(url_for('login'))

@app.route('/watchlist')
def watchlist():
    return render_template('watchlist.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/view')
def view():
    return render_template('screen.html')

@app.route('/get_main', methods=['GET'])
def get_main():
    username = session.get('username', None)
    if username is None:
        db = mongo_client['FInvest']
        collection = db['Stocks']
        documents = list(collection.find({}, {"_id": 0}))
        return jsonify(documents)
    else:
        db = mongo_client[username]
        collection = db['Default_Screen']
        documents = list(collection.find({}, {"_id": 0}))
        return jsonify(documents)
    
@app.route('/rename_watchlist', methods=['POST'])
def rename_watchlist():
    data = request.get_json()
    old_watchlist = data.get('old_watchlist')
    new_watchlist = data.get('new_watchlist')
    username = session.get('username', None)

    print(username, old_watchlist, new_watchlist)

    if username is None:
        return render_template('signup.html')
    else:
        if new_watchlist:
            db = mongo_client[username]
            old_collection = db[old_watchlist]
            old_collection.rename(new_watchlist)
            watchlist = db['Watchlist']
            watchlist.update_one({"Name": old_watchlist}, {"$set": {"Name": new_watchlist}})
            return redirect(url_for('watchlist'))
        else:
            return "error: new watchlist name"

@app.route('/update_fav', methods=['POST'])
def update_fav():
    username = session.get('username', None)
    if username is None:
        return render_template('signup.html')
    else:
        db = mongo_client[username]
        collection = db['Default_Screen']
        data = request.get_json()
        ticker = data.get('ticker')
        print(ticker)
        item = collection.find_one({"Stock": ticker})
        if item is not None:
            status = item.get('Book')   
            print(status)
            if(status == 1):
                collection.update_one({"Stock": ticker},{"$set":{"Book": 0}})
            else:
                collection.update_one({"Stock": ticker},{"$set":{"Book": 1}})
        else:
            print('status is None')
        return redirect(url_for('index'))

@app.route('/screen', methods=['POST'])
def screen():
    data = request.get_json()
    scrnName = data.get('scrnName')
    session['scrnName'] = scrnName
    print(session['scrnName'])
    return redirect(url_for('view'))

@app.route('/get_screen', methods=['GET'])
def get_screen():
    curUser = session['username']
    if 'scrnName' in session:
        curScreen = session['scrnName']
    else:
        curScreen = 'defaultScreen'
    db = mongo_client[curUser]
    collection = db[curScreen]
    documents = list(collection.find({}, {"_id": 0}))
    return jsonify(documents)

@app.route('/get_screen_name', methods=['GET'])
def get_screen_name():
    curUser = session.get('username', None)
    curScreen = session.get('scrnName', None)
    return jsonify({'screen': curScreen, 'user': curUser})

@app.route('/get_session', methods=['GET'])
def get_session():
    username = session.get('username', None)
    if username is None:
        return jsonify({'username': username})

    return jsonify({'username': username})

@app.route('/insert_data', methods=['POST'])
def insert_data():
    curUser = session['username']
    db = mongo_client[curUser]
    watchlist = db['Watchlist']

    data = request.get_json()
    watchlist_name = data.get('watchlist_name')
    date = data.get('date')
    time = data.get('time')
    tableData = data.get('table_data')
    
    collection = db[watchlist_name]
    collection.insert_many(tableData)
    watchlist.insert_one({
        "Name": watchlist_name,
        "Date": date,
        "Time": time
        })
    return redirect(url_for('index'))

@app.route('/get_watchlist_name', methods=['GET'])
def get_collection_name():
    curUser = session['username']
    db = mongo_client[curUser]
    collection = db['Watchlist']
    data = list(collection.find({}, {'Name': 1, 'Date': 1, 'Time' :1, '_id': 0}))
    values = [item['Name'] for item in data]
    return jsonify(values)  # Convert the list to JSON to return it.

@app.route('/get_watchlist', methods=['GET'])
def get_collection_data():
    curUser = session['username']
    db = mongo_client[curUser]
    collection = db['Watchlist']
    data = list(collection.find({}, {'Name': 1, 'Date': 1, 'Time' :1, '_id': 0}))
    return jsonify(data)  # Convert the list to JSON to return it.

@app.route('/delete_watchlist', methods=['POST'])
def delete_watchlist():
     curUser = session['username']
     db = mongo_client[curUser]

     data = request.get_json()
     watchlist_name = data.get("watchlist_name")
     
     collection = db[watchlist_name]
     collection.drop()

     watchlist = db['Watchlist']
     watchlist.delete_one({'Name': watchlist_name})

     return redirect(url_for('watchlist'))

@app.route('/register', methods=['POST'])
def register():
    db = mongo_client.FInvest
    user_name = request.form['username']
    pass_word = request.form['password']

    users = db.users
    existing_user = users.find_one({'name': user_name})

    if existing_user is None:
        hashpass = generate_password_hash(pass_word, method='scrypt')
        users.insert_one({'name': user_name, 'password': hashpass})
        return redirect(url_for('login'))
    else:
        flash('Username is used.')
        return render_template('signup.html')

@app.route('/signin', methods=['POST'])
def signin():
    db = mongo_client.FInvest
    users = db.users
    user_name = request.form['username']
    pass_word = request.form['password']
    remember_me = 'remember_me' in request.form
    print(user_name)
    print(pass_word)
    print(remember_me)
    login_user = users.find_one({'name': user_name})
    print(login_user)

    if login_user:
        if check_password_hash(login_user['password'], pass_word):
            session.permanent = remember_me
            print("session.permanent: ", session.permanent)
            if session.permanent is True:
                print('triggered')
                app.permanent_session_lifetime = timedelta(minutes=30)

            session['username'] = user_name
            print(session['username'])
            return redirect(url_for('home'))
        
    flash('Invalid username/password combination.')
    return redirect(url_for('login'))

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)