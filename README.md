### hack viewer
get code structure for open source project code

### why
I recently learn some open source project.
But reading source code is complicate,most of time I can not see the structure of project.
So,I decide to write a tool,where I can see the project in a higher level.

### run

```bash
git clone https://github.com/wcong/hackviewer.git
mvn spring-boot:run
```

then you will see a web page,where you input a start class,it will display content of the start class,and you can step into the class,see more.