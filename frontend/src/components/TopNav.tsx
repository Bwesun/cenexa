import { IonButton, IonIcon, IonImg, IonItem, IonText } from "@ionic/react";
import React from "react";
import Logo from '../../src/assets/ralogo.png';
import { ArrowRightLeft, BellIcon, ChevronsRight, Home, LeafIcon, LifeBuoy, RefreshCw, User2Icon } from "lucide-react";
// import { InAppBrowser, DefaultWebViewOptions, ToolbarPosition, iOSViewStyle, iOSAnimation } from '@capacitor/inappbrowser';
import { logIn, logInOutline, logOutOutline, person } from "ionicons/icons";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";

const TopNav: React.FC = () => {
    const { user, logout } = useAuth();
    const history = useHistory();

    // Logout handler
    const handleLogout = async () => {
    await logout();
    history.replace('/home');
  };

    // Webview to Open SSP Ledger in the App
    // const openWebView = async () => {
    //     await InAppBrowser.openInWebView({
    //         url: "https://sspledger.com.ng/",
    //         options: {
    //             showURL: false,
    //             showToolbar: true,
    //             closeButtonText: 'Close',
    //             showNavigationButtons: false,
    //             clearCache: true,
    //             clearSessionCache: false,
    //             mediaPlaybackRequiresUserAction: false,
    //             leftToRight: false,
    //             toolbarPosition: ToolbarPosition.BOTTOM,
    //             android: {
    //                 hardwareBack: true,
    //                 allowZoom: false,
    //                 pauseMedia: false,
    //             },
    //             iOS: {
    //                 allowOverScroll: false,
    //                 enableViewportScale: false,
    //                 allowInLineMediaPlayback: false,
    //                 surpressIncrementalRendering: false,
    //                 viewStyle: iOSViewStyle.PAGE_SHEET,
    //                 animationEffect: iOSAnimation.FLIP_HORIZONTAL,
    //                 allowsBackForwardNavigationGestures: true
    //             }
    //         }
    //     });
    // }
    return ( 
        <div className="flex justify-between items-center pt-4 pl-1 sm:px-4 md:px-8 lg:px-18" style={{
            background: 'var(--ion-color-light)'
        }}>
            <div className=" flex items-center justify-between gap-2">
                <IonItem lines="none" routerLink="/home" className="">
                <div className="flex items-center gap-2">
                    <IonImg src={Logo} className="w-10 h-10" />
                    <IonText className="text-sm font-semibold" color="primary">Cenexa</IonText>
                </div>
                </IonItem>
            </div>
            <div className="flex justify-end items-center">
                    <div className="flex">
                        {/* <IonButton fill="clear" shape="round">
                            <BellIcon size={22} />
                        </IonButton>  */}
                        {/* <IonButton size="small" fill="clear" onClick={openWebView} shape="round">
                            <RefreshCw size={22} className="mr-1" /> <span className="mr-2 text-sm">SSP</span> 
                        </IonButton> */}
                        {user ? (
                            <>
                        <IonButton routerLink="/profile" shape="round" fill="clear">
                            <IonIcon slot="icon-only" icon={person} size="small" />
                        </IonButton>
                        <IonButton onClick={handleLogout} shape="round" fill="clear">
                            <IonIcon slot="icon-only" icon={logOutOutline} />
                        </IonButton>
                            </>
                        ):(
                            <IonButton routerLink="/login" shape="round" fill="clear">
                                <IonIcon slot="icon-only" icon={logInOutline} />
                            </IonButton>
                        )}
                    </div>
            </div>
        </div>
     );
}
 
export default TopNav;