const ConnectToKaikas = async (
    KaikasWeb3Provider: any, 
) => {
    let provider = null;
    if (typeof window.klaytn !== "undefined")
    {
        provider = new KaikasWeb3Provider(window.klaytn)
        try {
            await provider.enable();
        } catch (error) {
            throw new Error("User Rejected");
        }
    } else {
        throw new Error("Kaikas not found");
    }
    return provider
}
export default ConnectToKaikas;
