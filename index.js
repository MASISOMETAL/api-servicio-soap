import express from "express";
import axios from "axios";
import xml2js from "xml2js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("conectado");
});

app.post("/api/getcurrency", (req, res) => {

    const url = 'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso';

    // Traemos el codigo ISO del pais
    const GetCountryCode = async (value) => {

        const xmlPayloadISOCode = `
            <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <CountryISOCode xmlns="http://www.oorsprong.org/websamples.countryinfo">
                        <sCountryName>${value}</sCountryName>
                    </CountryISOCode>
                </soap:Body>
            </soap:Envelope>
       `;

        try {
            const response = await axios.post(url, xmlPayloadISOCode, {
                headers: {
                    'Content-Type': 'text/xml',
                },
            })

            const responseData = response.data;

            GetCurrencyCountry(responseData, value)

        } catch (error) {
            console.error('SOAP request error:', error);
            throw error;
        }
    };

    // Traemos la moneda e imprimimos
    const GetCurrencyCountry = async (countryISO, pais) => {
        let countryNameClean;

        // pasando a texto el dato traido de countryISO
        xml2js.parseString(countryISO, (err, result) => {
            if (err) {
                console.error('Error parsing XML:', err);
            } else {
                countryNameClean = result['soap:Envelope']['soap:Body'][0]['m:CountryISOCodeResponse'][0]['m:CountryISOCodeResult'][0];
            }
        });

        const xmlPayloadCurrency = `
            <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <CountryCurrency xmlns="http://www.oorsprong.org/websamples.countryinfo">
                        <sCountryISOCode>${countryNameClean}</sCountryISOCode>
                    </CountryCurrency>
                </soap:Body>
            </soap:Envelope>
        `;

        try {
            const response = await axios.post(url, xmlPayloadCurrency, {
                headers: {
                    'Content-Type': 'text/xml',
                },
            })

            const responseData = response.data;

            // pasando a texto la respuesta
            xml2js.parseString(responseData, (err, result) => {
                if (err) {
                    console.error('Error parsing XML:', err);
                } else {
                    const moneda = result['soap:Envelope']['soap:Body'][0]['m:CountryCurrencyResponse'][0]['m:CountryCurrencyResult'][0]['m:sName'][0];

                    // creamos el objeto que devuelve
                    const resolve = {
                        pais: pais,
                        moneda: moneda
                    }

                    res.send(resolve)
                }
            });

        } catch (error) {
            console.error('SOAP request error:', error);
            throw error;
        }


    }

    //GetCountryCode(req.params.country)
    res.send(`El pais es ${req.body.country}`)


});

const port = process.env.port || 3100;
app.listen(port, () => console.log(`Escuchando en el puerto ${port}...`)); 