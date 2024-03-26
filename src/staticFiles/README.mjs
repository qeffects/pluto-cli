import { PROJECT_DISPLAY_NAME } from "../constants.mjs";

export default (projectName) => (
`Welcome to your new project, ${projectName}, feel free to edit the \`module.json\` file so it fits your needs.

See ###placeholder### for the various options of what you should add to the file.
    
Next steps:     

\`  ${PROJECT_DISPLAY_NAME} fetch\`     
      will fetch all of the modules available for download    


\`  ${PROJECT_DISPLAY_NAME} list\`    
      will show a list of all available modules (run after fetch)    


\`  ${PROJECT_DISPLAY_NAME} lock <m>\`    
      will lock an unlocked dependency to a specific version   


\`  ${PROJECT_DISPLAY_NAME} add <m>\`    
      will add a new module to your project    


\`  ${PROJECT_DISPLAY_NAME} install\`    
      will install all of the modules listed in your module.json    


\`  ${PROJECT_DISPLAY_NAME} update\`    
      will compare local and remote hashes for packages and update what's needed    
    
Remember to add \`require("${PROJECT_DISPLAY_NAME}")\` to the very top of your projects root file!    
Also add ${PROJECT_DISPLAY_NAME}.lock and /modules/* to your .gitignore, these should NOT be included with your distribution,    
if you want to lock a package to a specific version you should use the \`${PROJECT_DISPLAY_NAME} lock\` command.
    
If your project is meant to be a library you should (optionally) use init.lua in the root directory as your entrypoint
As this will shorten the require to just require("${projectName}")
`
);