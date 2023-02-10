
## Instructions

1.  Clone the repo

```
git clone git@github.com:somtirtharoy/side_stacker_game.git 
```

2. Run the following to bring up the app

```
cd side_stacker_game
mv secrets.env.example secrets.env
```

3. Edit the secrets.env file to add the necessary details required by django i.e: it should look like:
```
SECRET_KEY = 'some_value'
DEBUG=1
DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 [::1]
SQL_ENGINE=django.db.backends.postgresql
SQL_DATABASE=db_name
SQL_USER=user_name
SQL_PASSWORD=password
SQL_HOST=db
SQL_PORT=5432
```

4. Build the containers to run the app
```
docker-compose up --build
```

5. Make migrations and migrate
```
docker-compose run app python manage.py makemigrations
docker-compose run app python manage.py migrate
```

6. Create superuser
```
docker-compose run app python manage.py createsuperuser
```

6. Open two instances of localhost:8001 on your browser to play!


## Improvements
1. Add capabilities to save game and game states
2. Ability to create and authenticate users
3. Use redis server running on docker instead of in memory redis server used for Django channels
4. Rewrite the frontend using react
5. Write tests for frontend and backend
6. Add git prehooks for linting and formatting code