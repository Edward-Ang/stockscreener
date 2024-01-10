from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from itsdangerous import URLSafeTimedSerializer
from flask_mail import Mail, Message
from dotenv import load_dotenv
import os, re, secrets, smtplib

load_dotenv('config.env')

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY') or 'fallback_secret_key'
salt = secrets.token_hex(16)  # Generating a 16-byte salt using secrets module
serializer = URLSafeTimedSerializer(app.secret_key)
mongo_client = MongoClient('mongodb://localhost:27017/')
host_info = mongo_client['HOST']
print ("Mongo host info:", host_info)

app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('SMTP_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('SMTP_PASSWORD')

print(app.config['MAIL_SERVER'])
print(app.config['MAIL_PORT']) 
print(app.config['MAIL_USE_TLS'])
print(app.config['MAIL_USERNAME'])
print(app.config['MAIL_PASSWORD'])

try:
    server = smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT'])
    server.starttls()
    server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
    print("Connection successful!")
    server.quit()
except Exception as e:
    print("Error connecting to SMTP server:", e)

mail = Mail(app)

@app.route('/reset_password', methods=['GET', 'POST'])
def reset_request(): 
    db = mongo_client['FInvest']
    collection = db['users']
    email = request.form['email']
    user = collection.find_one({'name': email})

    if user:
        token = serializer.dumps(email, salt=salt)
        reset_url = url_for('reset_token', token=token, _external=True)
        msg = Message('Your Password Reset Link', sender=app.config['MAIL_USERNAME'], recipients=[email])
        msg.body = f'Here is your password reset link: {reset_url}'
        mail.send(msg)
        flash("Reset link is sent to your email.")
        return redirect(url_for('reset'))
    else:
        flash("Account doest not exist.")
        return redirect(url_for('reset'))

@app.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_token(token):
    db = mongo_client['FInvest']
    collection = db['users']
    try:
        email = serializer.loads(token, salt=salt, max_age=3600)
    except:
        return redirect(url_for('reset_request'))

    if request.method == 'POST':
        password = request.form['password']
        hashpass = generate_password_hash(password, method='scrypt')
        collection.update_one({'name': email}, {'$set': {'password': hashpass}})
        return redirect(url_for('login'))

    return render_template('reset_token.html', title='Reset Password', token=token)

def get_user_id(username):
    db = mongo_client['FInvest']
    collection = db['users']
    user_document = collection.find_one({"name": username})
    
    if user_document:
        user_id = str(user_document.get('_id'))
        return user_id
    else:
        return "User not exist"

def is_valid_email(email):
    # Regular expression for basic email validation
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # Using re.match to check if the email matches the pattern
    if re.match(pattern, email):
        return True
    else:
        return False

@app.route('/')
def index():
    if 'username' in session:
        print('\nCurrent user: ' + session['username'] + "\n")
    else:
        print('\nNo user is currently logged in.\n')
    return render_template('index.html')

@app.route('/home')
def home():
    if 'username' in session:
        print('\nCurrent user: ' + session['username'] + "\n")
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
    print("User[ ", session['username'], " ] is logged out.")
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/view')
def view():
    return render_template('screen.html')

@app.route('/reset')
def reset():
    return render_template('reset.html')

@app.route('/get_main', methods=['GET'])
def get_main():
    username = session.get('username', None)
    user_id = get_user_id(username)
    if username is None:
        db = mongo_client['FInvest']
        collection = db['Stocks']
        documents = list(collection.find({}, {"_id": 0}))
        return jsonify(documents)
    else:
        db = mongo_client[user_id]
        collection = db['Default_Screen']
        documents = list(collection.find({}, {"_id": 0}))
        return jsonify(documents)
    
@app.route('/rename_watchlist', methods=['POST'])
def rename_watchlist():
    print("-----Rename Watchlist-----")
    data = request.get_json()
    old_watchlist = data.get('old_watchlist')
    new_watchlist = data.get('new_watchlist')
    username = session.get('username', None)
    user_id = get_user_id(username)

    if username is None:
        return render_template('signup.html')
    else:
        if new_watchlist:
            db = mongo_client[user_id]
            old_collection = db[old_watchlist]
            old_collection.rename(new_watchlist)
            watchlist = db['Watchlist']
            watchlist.update_one({"Name": old_watchlist}, {"$set": {"Name": new_watchlist}})
            print(old_watchlist, " is renamed to ", new_watchlist, "\n")
            return redirect(url_for('watchlist'))
        else:
            return "error: new watchlist name"

@app.route('/update_fav', methods=['POST'])
def update_fav():
    print("-----Bookmark-----\n")
    username = session.get('username', None)
    user_id = get_user_id(username)
    if username is None:
        return render_template('signup.html')
    else:
        db = mongo_client[user_id]
        collection = db['Default_Screen']
        data = request.get_json()
        ticker = data.get('ticker')
        item = collection.find_one({"Stock": ticker})
        if item is not None:
            status = item.get('Book')
            if(status == 1):
                collection.update_one({"Stock": ticker},{"$set":{"Book": 0}})
            else:
                collection.update_one({"Stock": ticker},{"$set":{"Book": 1}})
        else:
            print('status is None\n')
        return redirect(url_for('index'))

@app.route('/screen', methods=['POST'])
def screen():
    data = request.get_json()
    scrnName = data.get('scrnName')
    session['scrnName'] = scrnName
    return redirect(url_for('view'))

@app.route('/get_screen', methods=['GET'])
def get_screen():
    curUser = session['username']
    user_id = get_user_id(curUser)
    if 'scrnName' in session:
        curScreen = session['scrnName']
    else:
        curScreen = 'defaultScreen'
    db = mongo_client[user_id]
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
    print("-----Save Watchlist-----\n")
    curUser = session['username']
    user_id = get_user_id(curUser)
    db = mongo_client[user_id]
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
    user_id = get_user_id(curUser)
    db = mongo_client[user_id]
    collection = db['Watchlist']
    data = list(collection.find({}, {'Name': 1, 'Date': 1, 'Time' :1, '_id': 0}))
    values = [item['Name'] for item in data]
    return jsonify(values)  # Convert the list to JSON to return it.

@app.route('/get_watchlist', methods=['GET'])
def get_collection_data():
    curUser = session['username']
    user_id = get_user_id(curUser)
    db = mongo_client[user_id]
    collection = db['Watchlist']
    data = list(collection.find({}, {'Name': 1, 'Date': 1, 'Time' :1, '_id': 0}))
    return jsonify(data)  # Convert the list to JSON to return it.

@app.route('/delete_watchlist', methods=['POST'])
def delete_watchlist():
     print("-----Delete Watchlist-----\n")
     curUser = session['username']
     user_id = get_user_id(curUser)
     db = mongo_client[user_id]

     data = request.get_json()
     watchlist_name = data.get("watchlist_name")
     
     collection = db[watchlist_name]
     collection.drop()

     watchlist = db['Watchlist']
     watchlist.delete_one({'Name': watchlist_name})

     return redirect(url_for('watchlist'))

@app.route('/register', methods=['POST'])
def register():
    print("-----Registration-----")
    db = mongo_client['FInvest']
    user_name = request.form['username']
    pass_word = request.form['password']

    user_email = is_valid_email(user_name)
    if user_email == False:
        flash('Username is not a valid email.')
        return render_template('signup.html')
    else:
        users = db['users']
        existing_user = users.find_one({"name": user_name})

        if existing_user is None:
            hashpass = generate_password_hash(pass_word, method='scrypt')
            inserted_user = users.insert_one({'name': user_name, 'password': hashpass})
            userid = str(inserted_user.inserted_id)

            new_db = mongo_client[userid]
            old_collection = db['Stocks']
            new_collection = new_db['Default_Screen']
            documents = list(old_collection.find())
            new_collection.insert_many(documents)
            print("User register secessfully!\n")
            return redirect(url_for('login'))
        else:
            flash('Username is used.')
            return render_template('signup.html')

@app.route('/signin', methods=['POST'])
def signin():
    print("-----Log In------")
    db = mongo_client.FInvest
    users = db.users
    user_name = request.form['username']
    pass_word = request.form['password']
    remember_me = 'remember_me' in request.form
    login_user = users.find_one({'name': user_name})

    if login_user:
        if check_password_hash(login_user['password'], pass_word):
            session.permanent = remember_me
            if session.permanent is True:
                app.permanent_session_lifetime = timedelta(minutes=30)

            session['username'] = user_name
            print("User logged in: ", session['username'])
            print("Session.permanent: ", session.permanent, "\n")
            return redirect(url_for('home'))
        
    flash('Invalid username/password combination.')
    return redirect(url_for('login'))

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)