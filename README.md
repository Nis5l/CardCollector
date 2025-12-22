# CardCollector
https://waifucollector.com \
Website for collecting, upgrading and trading Cards. \
I will be happy over every contribution, I don't care how bad the code is, we are all here to learn. \
If you have any questions or need help contact me on [discord](https://discord.com/invite/hftNUqNgRj)
## Setup
MYSQL/MariaDB database.\
For developement [XAMPP](https://www.apachefriends.org/download.html) might be an easy solution.
### Required configurations:
  #### Server (/server/Config.json)
  #### JWT secret
  - jwt_secret
  #### Email
  - email
  - email_password
  - smtp_server \
  For gmail account activating [less secure apps](https://support.google.com/accounts/answer/6010255?hl=en) might be neccessary.
  #### Database
  - db_connection

## Starting
### Server (rust)
`cargo run`
### Client (angular)
`yarn start`
## Docker
For production docker-compose is used.
## TODO:
  Fix Theme. \
  Fix Notifications. \
  Friend list with link to trade under collector and same for collectors in friends. \
  Sidebar theme. \
  Notifications style \
  Update Card Request \
  Pull times from db and display
