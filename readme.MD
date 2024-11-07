# Pluto

The package manager for Lua projects

## Installing Pluto

As a pre-requisite you need to have installed [Node.js](https://nodejs.org/en) and [git](https://git-scm.com/) on your computer    
And available in your path setup   
Next simply run `npm i -g qfx@pluto` in your command line   
After the command completes you can test if pluto is available by simply running `pluto`

## Using Pluto in your projects

Start off by running `pluto fetch` this will update (or create a new)    
your local package cache to the newest available version     
This step is a requisite for doing almost anything else  
  
If you already have a project where you want to use pluto packages you can simply navigate to it in your command line, e.g.  
`cd project-folder` and run  
`pluto init -c` this will run an interactive prompt and initialize the file structure needed for pluto operation

Alternatively if you want a fresh project you can run `pluto init` without any arguments, it will create a new folder in the current working directory for your command line

### **!! Important !!**
If you want pluto to work seamlessly with your regular require you have to add this to the very top of the start of your code (e.g. main.lua in love or similar):  
```lua
require("pluto")
```

After this you can simply use `require("PackageName")` instead of `require("pluto_modules/PackageName")`  

### Gitignore
You should add the following entries to your .gitignore file:
pluto.lock
/pluto_modules/*


## Adding a first package to your project

After having initialized a project you can run `pluto list` to get a list of all available packages  

Once you have a specific package in mind run `pluto add PackageName`  
After you have added everything you need you can run `pluto install` which will fetch and install the packages locally (pluto add only changes your module.json)  

## Version locking
### Version modifiers
Before we get to the commands to lock and unlock packages it's important to understand version modifiers in pluto,  
Simply a version modifier is an addition to the package name, there are 2 types:  
#### Git tag lock
Sets up a package to track a specific git tag, it's formatted like `PackageName@1.0.0` 1.0.0 being the name of the git tag

#### Git commit lock
Sets up a package to track a specific git commit, it's formatted like `PackageName#15fasd` 15fasd being the git commit you wish to track

Package versions can be made stable between installs and updates by either:  
Installing your package initially with a version modifier like this:  
`pluto add PackageName#as3123`  

Or alternatively you can run the lock command like so  
`pluto lock PackageName` Which will lock the package to the current commit  
`pluto lock PackageName -t 1.0.0` Which will lock the package to a specific git tag  
`pluto lock PackageName -c 14qe51d` Which will lock the package to a specific git commit  

And if you no longer need your version to be locked simply run  
`pluto unlock PackageName`  

It's important to note that locking a package to a specific tag will change it's module name so 
```lua
require("PackageName")
```
becomes
```lua
require("PackageName#5123dfs")
```

# All of the Commands:

## pluto add
Adds a new dependency to your current root project  

 `-h` Shows help  
 `-n <Name>` Bypasses the name prompt, can also compound with a tag or commit like name@tag or name#commitHash  
 `-c` Sets the new dependency to track a commit (find in git or use the pluto inspect <Name> -c command to list them)  
 `-t` Sets the new dependency to track a tag (find in git or use the pluto inspect <Name> -t command to list them)  
 `-l` Sets the new dependency to track the latest commit  

## pluto fetch
Initializes or updates your local module depot(cache)  
Run this whenever you want to update packages to their newest commit or new packages have been added  

`-h` Shows help  

## pluto init
Initializes your new project directory and a basic file structure skeleton.  

  `-h` Shows help for this command  
  `-n <Name>` Skips the name prompt  
  `-c` Initializes the project structure in the current working directory  

## pluto inspect [package]
Shows all of the information about a module  

  `package` the name of the module to be inspected  
  `-h` Shows help for this command   
  `-c <commit>` Finds if this package has a commit  
  `-c` Lists all of the commits for this module  
  `-t <tag>` Finds if this package has a tag  
  `-t` Lists all of the tags for this module  

## pluto install
Installs all of your dependencies and their sub dependencies in to your project directory

  `-h` Shows help for this command   

## pluto list
List view of all available/installed/dependent modules  

`-h` Shows help for this command  
`-i` Lists installed modules  
`-b` Bypasses compatiblity checks  
`-d` Lists dependencies  
`no arguments` Lists modules that are available to be added to your project, including your framework and runtime settings  

## pluto lock [package]
Locks a dependency to a specific version  

`package` Name of the package to lock  
`-h` Shows help for this command   
`-t <tag>` Locks a dependency to a specific git tag  
`-c <commit>` Locks a dependency to a specific git commit  
`no arguments` Locks a dependency to the current commit  

## pluto remove [package]
Removes a package from your dependencies  

`package` Name of the package to remove  
`-h` Shows help for this command  

## pluto unlock [package]
Unlocks the version of the dependency to be installed

`package` Name of the package to unlock  
`-h` Shows help for this command  

## pluto update
Updates all of your packages to their latest available versions  
Can also be used to reset pluto_modules and pluto.lock  

`-h` Shows help for this command  

# module.json

This file contains the information about your project such as all of the direct dependencies, name, description etc
Most of these are fairly self-explanatory, just string fields for display or future use, you can populate them at your leisure.  

There are 2 interesting optional fields:

"runtime": "*"  
"frameworks": ["*"]  

As initiated they won't do anything, but if you desire you can change them to hide packages that  
Don't fit the target runtime and/or framework conditions  
Here's the list of runtimes, simply copy one in to your module.json if you wish:
- "Luajit2.0"
- "Luajit2.1"
- "Luajit2.1beta3"
- "Lua5.0"
- "Lua5.1"
- "Lua5.2"
- "Lua5.3"
- "Lua5.4"
- "Luau"

Note that there's a bit of a compatibility matrix going on, with your project having "Lua5.4" it will act as if supports 5, 5.1, 5.2 etc.

And here's the list of the frameworks:
- "love12"
- "love11"
- "love10"
- "lapis"
- "gmod"
- "roblox"

## Contributing new packages

See the repo here: [Pluto Packages](https://github.com/qeffects/pluto-packages/tree/main)