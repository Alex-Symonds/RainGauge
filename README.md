## Rain Gauge Visualisation
A long-weekend project to display rain gauge information (for one particular rain gauge), including a time series graph and a map.


### Project goals
* Increase experience with Bootstrap
* Try some new things: Plotly for generating graphs, Leaflet to display a map
* Learn how to get data from an Excel file into a Django database
* Using Django solely as an API and handling the frontend separately


### If I had more time
* DRY out the types
* Add a "Custom Date Range" for people who want to specify their own range, but only want full days
* Add automated tests
* Add cute little icons to the headings
* Support dark mode


### How to run
0. Setup a virtual environment and copy the entire repo inside
1. Install pip modules as per raingauge_be/requirements.txt
2. python manage.py runserver (or the equivalent for your OS)
3. Ensure its URL is http://127.0.0.1:8000/
4. python manage.py makemigrations
5. python manage.py migrate
6. Insert rain gauge data into the database[^1]
7. Install npm modules as per raingauge_fe/npmlist.json
8. npm run dev
9. Visit http://localhost:3000/ in your browser

[^1]: If you have an Excel file called "Data.xlsx", with timestamps in column A and readings in column B, and it's in the raingauge_be folder, you can achieve this by running populateDatabase.py
