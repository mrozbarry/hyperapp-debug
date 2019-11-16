# TODO

## Tasks

 - [x] App should run normally until the devtool is opened
   - [x] Track state of connection in app
   - [x] Always keep history of dispatch
   - [x] On connect, submit history
     - If devtool panel is opened
     - If devtool app has picked the app id
   - [x] Route all dispatches through to devtool
   - [x] Why is the panel not showing the Init action?
     - Was not storing subscriptions because app wasn't being debugged yet
 - [x] Submit registation on panel open+active
 - [x] Improve communication bridge
 - [x] Improve panel app

 - Future: add window.open variant of devtool
   - [ ] Allow user to specify custom bridge, default to devtool
