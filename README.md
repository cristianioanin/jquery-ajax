# jquery-ajax
**Informal School of IT - jQuery AJAX assignment**

[See this project live](https://cristianioanin.github.io/jquery-ajax/)

Having a set of students data, which include a list of disciplines and the respective grade for each, use AJAX to fetch the resources.
Results are to be displayed like a grid of cards or a table.
The list should have sorting functionality.

**Implementation**
I used Reavealing-Module Pattern, where I defined a DataController, a ViewController and an AppController. 
Each of the modules encapsulates functionality strictly related and exposes methods and fields only via a *return* block-statement. This patttern mimics ES6 modules.

![Card Components](/screenshots/2019-03-09%20(11).png)

There's no remote server, data is being stored as local JSON file.
The sorting functionality makes use of the CSS order property, and does not sort the data structure holding the results. 

![Sorting Cards](/screenshots/2019-03-09%20(12).png)

The ViewController returns methods for displaying the results as a grid of cards or as a table.

![Sorting Cards](/screenshots/2019-03-09%20(13).png)
