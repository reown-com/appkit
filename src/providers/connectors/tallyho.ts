import detectEthereumProvider from 'tallyho-detect-provider';
import TallyHoOnboarding from 'tallyho-onboarding'

const ConnectToTallyHo: any = async () => {
    let provider = null;
    try{
        provider = await detectEthereumProvider({mustBeTallyHo: true});
        if (!provider){
          const onboarding = new TallyHoOnboarding();
          await onboarding.startOnboarding();
          throw new Error('No TallyHo Provider found, redirecting to onboarding');
        }
    } catch (error) {
        console.log("User Rejected:"  + error);
    }
    return provider;
  };

  export default ConnectToTallyHo;