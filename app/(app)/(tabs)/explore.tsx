import { UserContext } from '@/hooks/userInfo';
import { useLocalSearchParams } from 'expo-router';
import React, { useContext } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewScreen = () => {
    const { userInfo } = useContext(UserContext) as any


    const hideHeaderFooterAndAddPadding = `
    (function() {
      // Hide header
      const header = document.querySelector('nav');
      if (header) header.style.display = 'none';

      // Hide footer
      const footer = document.querySelector('footer');
      if (footer) footer.style.display = 'none';

     const section = document.querySelector('section');
      if (section) section.style.padding = '0px!important'; 

      // Add padding to body
      document.body.style.paddingTop = '0px!important';
      document.body.style.boxSizing = 'border-box';
    })();
    true;
  `;

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                source={{ uri: userInfo?.role == "user" ? `https://sustylo.com/salonpartner` : "https://admin.sustylo.com/" }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                injectedJavaScript={`
          const meta = document.createElement('meta');
          meta.setAttribute('name', 'viewport');
          meta.setAttribute('content', 'width=600');
          document.getElementsByTagName('head')[0].appendChild(meta);
          ${ userInfo?.role == "user" ? hideHeaderFooterAndAddPadding : null}
        `}
                scalesPageToFit={true}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default WebViewScreen;
