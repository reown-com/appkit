
import { promises } from 'fs';
import tiged from 'tiged';
import chalk from 'chalk';

export async function checkDirectoryExists(directory) {
    try {
        await promises.access(directory);
        return true;
    } catch (error) {
        return false;
    }
  }

export function generateRepoUrl(answerFramework, answerLibrary) {
    switch (answerFramework.framework) {
        case 'nextjs':
            switch (answerLibrary.library) {
                case 'wagmi':
                    return "reown-com/appkit-web-examples/nextjs/next-wagmi-app-router";
                case 'ethers':
                    return "reown-com/appkit-web-examples/nextjs/next-ethers-app-router";
                case 'solana':
                    return "reown-com/appkit-web-examples/nextjs/next-solana-app-router";
                case 'multichain':
                    return "reown-com/appkit-web-examples/nextjs/next-multichain-app-router";
            }
        case 'react':
            switch (answerLibrary.library) {
                case 'wagmi':
                    return "reown-com/appkit-web-examples/react/react-wagmi";
                case 'ethers':
                    return "reown-com/appkit-web-examples/react/react-ethers";
                case 'solana':
                    return "reown-com/appkit-web-examples/react/react-solana";
                case 'multichain':
                    return "reown-com/appkit-web-examples/react/react-multichain";
            }
        case 'vue':
            switch (answerLibrary.library) {
                case 'wagmi':
                    return "reown-com/appkit-web-examples/vue/vue-wagmi";
                case 'ethers':
                    return "reown-com/appkit-web-examples/vue/vue-ethers";
                case 'solana':
                    return "reown-com/appkit-web-examples/vue/vue-solana";
                case 'multichain':
                    return "reown-com/appkit-web-examples/vue/vue-multichain";
            }
        default:
            return "reown-com/appkit-web-examples/react/react-wagmi";
    }
    
}

export async function cloneRepository(repoUrl, directoryName) {
    try {
        const tip = chalk.hex('#FFA500');   

        console.log(`
        ${tip('')}
        ${tip('Downloading the repository ...')}
        `);

        const emitter = tiged(repoUrl, {
            disableCache: true,
	        force: true,
            verbose: false
        });
      
        await emitter.clone(directoryName);
    
        console.log(`
        ${tip('cd '+ directoryName)}
        ${tip('npm install')}
        ${tip('npm run dev')}
        `);
    } catch (error) {
      console.error('Failed to clone the repository:', error);
    }
  }

  export const banner = `
     @@@@@@@           @@@@@@@@@@@@@@@@@@      
   @@@@@@@@@@@      @@@@@@@@@@@@@@@@@@@@@@@@   
  @@@@@@@@@@@@@    @@@@@@@@@@@@@@@@@@@@@@@@@@  
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@  
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@@   @@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@   @@@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@  @@@@@@@@@@@@@             Reown AppKit CLI 
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@   @@@@@@@@@@@@@             The easy way to build dApps!
 @@@@@@   @@@@@@  @@@@@@@@@@@   @@@@@@@@@@@@@@ 
 @@@@@@   @@@@@@  @@@@@@@@@@@  @@@@@@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@   @@@@@@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@  
  @@@@@@@@@@@@@    @@@@@@@@@@@@@@@@@@@@@@@@@@  
   @@@@@@@@@@@      @@@@@@@@@@@@@@@@@@@@@@@@   
      @@@@@            @@@@@@@@@@@@@@@@@@      
`