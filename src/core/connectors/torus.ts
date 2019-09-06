import Torus from "@toruslabs/torus-embed";

const ConnectToTorus = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const torus = new Torus();
        await torus.init();
        await torus.login(); // await torus.ethereum.enable()
        resolve(torus.provider);
      } catch (err) {
        reject(err)
      }
    });
};
  
export default ConnectToTorus;