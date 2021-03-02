const config = require('./config.js');

const express= require('express');
const app=express();
const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');
app.use(express.json());
app.use(express.urlencoded());



app.get('/sentiment',(req,res) => {

    console.log(req.query.message);

    const languageTranslator = new LanguageTranslatorV3({
        version: '2018-05-01',
        authenticator: new IamAuthenticator({
          apikey: config.APIKEY_TRANSLATE,
        }),
        serviceUrl: config.URL_TRANSLATE,
      });
      
    const translateParams = {
        text: req.query.message,
        modelId: 'es-en',
      };

    const toneAnalyzer = new ToneAnalyzerV3({
        version: '2017-09-21',
        authenticator: new IamAuthenticator({
          apikey: config.APIKEY_TONE,
        }),
        url: config.URL_TONE,
      });

    languageTranslator.translate(translateParams)
      .then(translationResult => {
        console.log(JSON.stringify(translationResult.result.translations[0].translation, null, 2));
        const toneParams = {
            toneInput: { 'text': translationResult.result.translations[0].translation },
            contentType: 'application/json',
            acceptLanguage:'es',
          };
          toneAnalyzer.tone(toneParams)
            .then(toneAnalysis => {
            console.log(JSON.stringify(toneAnalysis, null, 2));  
            console.log({"sentiment":toneAnalysis.result.document_tone.tones[0].tone_id });
            res.send(toneAnalysis.result.document_tone.tones[0].tone_id );
            })
            .catch(err => {
            console.log('error:', err);
            });
      })
      .catch(err => {
        console.log('error:', err);
      });


    
      
      


  });

app.listen(config.PORT,()=> console.log(`listening on port ${config.PORT}`));