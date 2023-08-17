const express = require("express")
const session = require("express-session")
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser")
const cors = require("cors")
const ip = require('ip');
const randomstring = require("randomstring");
const http = require('http');
const cmd = require("./modulos/bash")
const https = require('https');
let criadas = require("./cache/created.json")
let fisicasCriadas = require("./cache/fisica.json")
const socketioJwt = require("socketio-jwt")
const fs = require("fs");
const fspromise = require("fs").promises;
const authConfig = require("./config/auth.json");
const request = require('request');
const jwt = require("jsonwebtoken")
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook("https://discord.com/api/webhooks/1086420149990596712/BtnfDaPf9Te1f0ujHUDAlCdo7pWUHoBXmD7f6ifNgwVenUEnwStXG-cwfJEB7TnK4SLf");
const hookLOGS = new Webhook("https://monitoramento.grupobright.com/index.php/wp-json/automatorwp/webhooks/nhhun9dh");
const tls = require('tls');
const { EventEmitter } = require("stream")
const timeout = require('connect-timeout');

// Substitua o método addListener do TLSSocket para chamar emitter.setMaxListeners
/*
const originalAddListener = tls.TLSSocket.prototype.addListener;
tls.TLSSocket.prototype.addListener = function (event, listener) {
  const result = originalAddListener.apply(this, arguments);
  this.setMaxListeners(this.getMaxListeners() + 1);
  return result;
};*/

var customSort = function (a, b) {
  return (Number(a.match(/(\d+)/g)[0]) - Number((b.match(/(\d+)/g)[0])));
}

function formatNumber(num) {
  return num.toString().padStart(2, '0');
}
function ordenarLista(lista) {
  return lista.sort((a, b) => {
    const numA = parseInt(a.split('-')[1]);
    const numB = parseInt(b.split('-')[1]);
    
    if (numA < numB) return -1;
    if (numA > numB) return 1;
    return 0;
  });
}


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason, promise);
  // handle the error gracefully
});



//MODO DEVELOPER////////////////////////
let developMode = false 
////////////////////////////////////////
let disableGoogle = false
let disableAzure = false
let gamesList = [
  "bcg",
  "blackdesert",
  "cod",
  "cod-steam",
  "dauntless",
  "eldenring",
  "fortnite",
  "god-of-war",
  "gtav-epic",
  "gtav-steam",
  "gtav-rockstar",
  "lol",
  "lostark",
  "reddead-epic",
  "reddead",
  "rleague-epic",
  "rleague-steam",
  "hoglegacy",
  "fifa22",
  "overwatch",
  "stream-teste1",
  "fifa23",
  "cs-go",
  "horizonzerodawn"
]



let sairVar = {}

defaultPOSTOptions = {
  "rejectUnauthorized": false,
  "method": "POST",
  headers: {
    Authorization: "PVEAPIToken=root@pam!bcg=697c46ce-903e-4ad5-96df-b693371363b6",

  }
}

defaultDELETEOptions = {
  "rejectUnauthorized": false,
  "method": "DELETE",
  headers: {
    Authorization: "PVEAPIToken=root@pam!bcg=697c46ce-903e-4ad5-96df-b693371363b6",

  }
}

defaultGETOptions = {
  "rejectUnauthorized": false,
  headers: {
    Authorization: "PVEAPIToken=root@pam!bcg=697c46ce-903e-4ad5-96df-b693371363b6",

  }
}

defaultDELETEOptions2 = {
  "rejectUnauthorized": false,
  "method": "DELETE",
  headers: {
    Authorization: "PVEAPIToken=root@pam!bcg=d6749d27-98cb-4c30-b5c9-152bdeee87d5",

  }
}


defaultPOSTOptions2 = {
  "rejectUnauthorized": false,
  "method": "POST",
  headers: {
    Authorization: "PVEAPIToken=root@pam!bcg=d6749d27-98cb-4c30-b5c9-152bdeee87d5",

  }
}


defaultGETOptions2={
  "rejectUnauthorized": false,
  headers: {
    Authorization: "PVEAPIToken=root@pam!bcg=d6749d27-98cb-4c30-b5c9-152bdeee87d5",

  }
  
}

streamApiHeaders = {
  "rejectUnauthorized": false,
  headers: {
    Authorization: "asdgbaaasdhfasdgowoyt984thasdf93hfa0dhgoahdgdjba:wo4yth948thanohgd0a9gh8radsfasdfeghaohgaugfiwhh28hg9ag",
  }
}

streamApiHeadersPOST = {
  "rejectUnauthorized": false,
  method: "POST",
  headers: {
    Authorization: "asdgbaaasdhfasdgowoyt984thasdf93hfa0dhgoahdgdjba:wo4yth948thanohgd0a9gh8radsfasdfeghaohgaugfiwhh28hg9ag",
  }
}



let ggsProcessoCriar={}
let ggsToDelete=["bcg-12300000","bcg-1238127387"]

function getTime() {
  const dateObject = new Date();

  const date = (`0 ${dateObject.getDate()}`).slice(-2);

  const month = (`0 ${dateObject.getMonth() + 1}`).slice(-2);

  const hours = dateObject.getHours();

  const minutes = dateObject.getMinutes();

  const seconds = dateObject.getSeconds();


  // prints date & time in YYYY-MM-DD HH:MM:SS format
  return (` ${month}-${date} ${hours}:${minutes}:${seconds}`);
}

const requestPromise = util.promisify(request);

Array.prototype.remove = function (from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

//const { Server } = require("socket.io");

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  })
}



async function googleScheduler(){
  while (true){
    try{
      let respon2 = (await cmd(`gcloud compute instances list --format=json`))

      JSON.parse(respon2).forEach(async vm => {

        try{
          if (vm.status=="TERMINATED"){
            console.log(vm.name)
            let zona=vm.zone.split("https://www.googleapis.com/compute/v1/projects/serious-bearing-388518/zones/")[1]
            await new Promise(res => setTimeout(res, 1800000));

            try{
              statusdavm = JSON.parse(await cmd(`gcloud compute instances describe ${vm.name} --format=json --zone=southamerica-east1-c`))
              if (statusdavm.status == "TERMINATED"){
                console.log(await cmd(`echo Y | gcloud compute instances delete ${vm.name} --project serious-bearing-388518 --zone ${zona} --delete-disks=all`))
              }

            }catch(err){
              //
            }
            
          }
        }catch(err){
          console.log(err)
        }
        
        /*
        if (vm.name != "bcg-image") {
          paradas.push(vm.name)
        }*/
      });
    }catch(err)
    {
      console.log(err)
    }

    await new Promise(res => setTimeout(res, 600000));
  }
}

//googleScheduler()

async function stopSuspended(){
  while (true){
    try {
      

      let nodesLivres = {}

      console.log("PARANDO FISICAS SUSPENDIDAS.")

      requestPromise("https://servidor.brightcloudgames.com.br:8094/api2/json/cluster/resources", defaultGETOptions2).then(async (responsa) => {


        //console.log(responsa.body)

        await new Promise(res => setTimeout(res, 6000));

        const data = JSON.parse(responsa.body)["data"]

        for await (const x of data) {
          if (x.type == "qemu") {
            let actual = x.id.split("qemu/")[1]
            if (x.status == "suspended") {
              if (x.node != "CLUSTER") {
                nodesLivres[x.node] = actual
              }
            }
          }
        }



        requestPromise("https://servidor.brightcloudgames.com.br:8093/api2/json/cluster/resources", defaultGETOptions).then(async (responsa2) => {

          await new Promise(res => setTimeout(res, 6000));

          //console.log("CRIANDO FISICA!- ESTAGIO 3")
          //console.log(JSON.parse(responsa.body))
          const dataf = JSON.parse(responsa2.body)["data"]

          for await (const z of dataf) {
            if (z.type == "qemu") {
              let actual = z.id.split("qemu/")[1]
              if (z.status == "suspended") {
                if (z.node != "CLUSTER" ) {
                  //if ( z.node != "sp10" ) {
                    nodesLivres[z.node] = actual
                 // }
                }
              }
            }
          }


          Object.keys(nodesLivres).forEach(async nodee => {
            let digit
            let headersSelecionado
            if (nodee.split("BCG")[1] >= 9) {
              digit = 4
              headersSelecionado=defaultPOSTOptions2
            } else {
              digit = 3
              headersSelecionado=defaultPOSTOptions
            }

            requestPromise(`https://servidor.brightcloudgames.com.br:809${digit}/api2/json/nodes/${nodee}/qemu/${nodesLivres[nodee]}/status/stop`, headersSelecionado).then(async (respostinha) => {
              //console.log(respostinha.body)

            }).catch((err) =>{console.log(err)})
          })

        }).catch((err) =>{console.log(err)})



      }).catch((err) =>{console.log(err)})
    }catch(err){
      console.log(err)
    }
    await new Promise(res => setTimeout(res, 60000));
  }
}

stopSuspended()


async function check3AM() {
  while (true) {
    const date = Date()
    const new_date = new Date(date)
    const hours = new_date.getHours()
    const minutes = new_date.getMinutes()

    if (hours == 5 && minutes == 0) {


      try{
        console.log("PARANDO VMS - Google")


        let respon222 = (await cmd(`gcloud compute instances list --format=json`))

        JSON.parse(respon222).forEach(async vm => {

          if (vm.name != "bcg-01") {
            console.log("Desligando pelo check 3AM: " +await cmd(`gcloud compute instances stop ${vm.name} --zone=southamerica-east1-c`))
            //console.log(await cmd(`echo Y | gcloud compute instances delete ${vm.name} --project serious-bearing-388518 --zone southamerica-east1-c --delete-disks=all`))
          }
        });
      }catch(err){
        console.log(err)
      }

      try{
        let responnn = JSON.parse(await cmd(`az vm list -d -g brightcloud-app -d --output json`))

        responnn.forEach(async vm => {
          //tempList.push(vm.name)
          await cmd(`az vm stop --resource-group brightcloud-app --name vm.name --skip-shutdown`)
          await cmd(`az vm deallocate --resource-group brightcloud-app --name ${vm.name}`)
        })
      }catch(err){
        console.log(err)
      }

      try {
        criadas={}
        fisicasCriadas={}

        let nodesLivres = {}

        console.log("PARANDO FISICAS.")

        requestPromise("https://servidor.brightcloudgames.com.br:8094/api2/json/cluster/resources", defaultGETOptions2).then(async (responsa) => {


        //console.log(responsa.body)
          await new Promise(res => setTimeout(res, 6000));

          const data = JSON.parse(responsa.body)["data"]

          for await (const x of data) {
            if (x.type == "qemu") {
              let actual = x.id.split("qemu/")[1]
              if (x.status == "running") {
                if (x.node != "CLUSTER")  {
                  ///if ( x.node != "sp10" ) {
                    nodesLivres[x.node] = actual
                  //}
                }
              }
            }
          }



          requestPromise("https://servidor.brightcloudgames.com.br:8093/api2/json/cluster/resources", defaultGETOptions).then(async (responsa2) => {

            await new Promise(res => setTimeout(res, 6000));

            //console.log("CRIANDO FISICA!- ESTAGIO 3")
            //console.log(JSON.parse(responsa.body))
            const dataf = JSON.parse(responsa2.body)["data"]

            for await (const z of dataf) {
              if (z.type == "qemu") {
                let actual = z.id.split("qemu/")[1]
                if (z.status == "running") {
                  if (z.node != "CLUSTER"/* || z.node != "sp10"*/ ) {
                    nodesLivres[z.node] = actual
                  }
                }
              }
            }


            Object.keys(nodesLivres).forEach(async nodee => {
              let digit
              let headersSelecionado
              if (nodee.split("BCG")[1] >= 9) {
                digit = 4
                headersSelecionado=defaultPOSTOptions2
              } else {
                digit = 3
                headersSelecionado=defaultPOSTOptions
              }

              requestPromise(`https://servidor.brightcloudgames.com.br:809${digit}/api2/json/nodes/${nodee}/qemu/${nodesLivres[nodee]}/status/stop`, headersSelecionado).then(async (respostinha) => {
                //console.log(respostinha.body)

              }).catch((err) =>{console.log(err)})
            })

          }).catch((err) =>{console.log(err)})



        }).catch((err) =>{console.log(err)})


       



      } catch (errinho) {
        console.log(errinho)
      }

      await new Promise(res => setTimeout(res, 60000));
    } else {
      const hours = new_date.getHours()
      const minutes = new_date.getMinutes()
      //console.log(hours,":",minutes)
      await new Promise(res => setTimeout(res, 5000));
    }



  }
}


check3AM()



async function check5PM() {
  while (true) {
    const date = Date()
    const new_date = new Date(date)
    const hours = new_date.getHours()
    const minutes = new_date.getMinutes()

    if (hours == 17 && minutes == 0) {

      try {

        console.log("PARANDO VMS - Google")



        /*
        let respon2 = (await cmd(`gcloud compute instances list --filter='status:RUNNING' --format=json`))
gcloud compute instances list --filter='status:TERMINATED' --format=json
        JSON.parse(respon2).forEach(async vm => {
          if (vm.name != "bcg-rafa-grid") {
            await cmd(`gcloud compute instances stop ${vm.name} --zone=southamerica-east1-c`)
            await new Promise(res => setTimeout(res, 3000));
            //console.log(vm.name)
          }
        });*/

        let i = 1
        while (i <= 87) {
          i = ('0' + i).slice(-2)
          console.log(`Parando bcg-${i}`)
          try {
            await cmd(`gcloud compute instances stop bcg-${i} --zone=southamerica-east1-c`)
          } catch (err) {
            console.log(err)
          }
          i++
        }



        let vb = 1
        while (vb <= 78) {
          vb = ('0' + vb).slice(-2)
          console.log(`Parando bcg-${vb} conta secundaria`)
          try {
            await cmd(`docker run --rm --volumes-from gcloud-config gcr.io/google.com/cloudsdktool/google-cloud-cli gcloud compute instances stop bcg-${vb} --zone=southamerica-east1-c`)
          } catch (err) {
            console.log(err)
          }
          i++
        }
        /*

        let responSegunda = (await cmd(`docker run --rm --volumes-from gcloud-config gcr.io/google.com/cloudsdktool/google-cloud-cli gcloud compute instances list --filter='status:RUNNING' --format=json`))

        JSON.parse(responSegunda).forEach(async vm => {

          await cmd(`docker run --rm --volumes-from gcloud-config gcr.io/google.com/cloudsdktool/google-cloud-cli gcloud compute instances stop ${vm.name} --zone=southamerica-east1-c`)
          await new Promise(res => setTimeout(res, 3000));
          //console.log(vm.name)

        });

        delete responSegunda*/


        let diskList1 = JSON.parse(await cmd(`gcloud compute disks list --format json`))


        diskList1.forEach(async disk => {
          if (!disk.users) {
            console.log("Disco não esta anexado - ", disk.name)
            await cmd(`echo Y | gcloud compute disks delete ${disk.name} --zone=southamerica-east1-c`)
            await new Promise(res => setTimeout(res, 3000));
          } else {
            console.log("Disco anexado - ", disk.name)
          }
        });

        delete diskList1

        let diskList2 = JSON.parse(await cmd(`docker run --rm --volumes-from gcloud-config gcr.io/google.com/cloudsdktool/google-cloud-cli gcloud compute disks list --format json`))


        diskList2.forEach(async disk => {
          if (!disk.users) {
            console.log("Disco não esta anexado - ", disk.name)
            await cmd(`echo Y | docker run --rm --volumes-from gcloud-config gcr.io/google.com/cloudsdktool/google-cloud-cli gcloud compute disks delete ${disk.name} --zone=southamerica-east1-c`)
            await new Promise(res => setTimeout(res, 3000));
          } else {
            console.log("Disco anexado - ", disk.name)
          }
        });

        delete diskList2




        //console.log(` - ${instance.name} ${instance.status}`);


      } catch (errinho) {
        console.log(errinho)
      }

      await new Promise(res => setTimeout(res, 50000));
    } else {
      const hours = new_date.getHours()
      const minutes = new_date.getMinutes()
      //console.log(hours,":",minutes)
      await new Promise(res => setTimeout(res, 5000));
    }



  }
}


async function adicionarCriado() {
  while (true) {
    try {
      JSON.parse(JSON.stringify(criadas))
      fs.writeFile("./cache/created.json", JSON.stringify(criadas), async function (err) {
        if (err) { throw(err) }

        fs.open("./cache/created.json", "r+", async (err,fd)=>{
          if (err) throw err;

          
          fs.fsync(fd,(err) =>{
            if (err) throw err;

            fs.close(fd, (err)=>{
              if (err) throw err;
              console.log("Created Saved!")
            })

            
          })

        })

      })
    } catch {//
    }

    try {
      JSON.parse(JSON.stringify(fisicasCriadas))
      await fspromise.writeFile("./cache/fisica.json", JSON.stringify(fisicasCriadas), async function (err) { if (err) { console.log(err) } })
    } catch {//
    }

    await new Promise(res => setTimeout(res, 5000));


  }
}


async function backupCache() {
  while (true) {
    try {
      await fspromise.writeFile("./cache/backupCreated.json", JSON.stringify(criadas), async function (err) { if (err) { console.log(err) } })
      await fspromise.writeFile("./cache/backupFisica.json", JSON.stringify(fisicasCriadas), async function (err) { if (err) { console.log(err) } })
    } catch {//
    }
    await new Promise(res => setTimeout(res, 30000));
  }
}

adicionarCriado()
backupCache()



function parseCookies(cs) {
  try{
  var list = {},
    rc = cs;

  rc && rc.split(';').forEach(function (cookie) {
    var parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
}catch(err){
  console.log(err)
}
}

const app = express();


let pcSalvo = {}

let assinaturaSalva = {}
let assinaturaSalvaPriority = {}

global.globalReemo = {}
global.globalCreating = {}
global.globalUsing = {}

let filaCriandoGoogle = []
let filaCriandoAzure = []
let filaFisica = []


let nodeUser = {}
global.creating = {}
let reemoIds = {}
global.userStatus = {}
let fila = []
let azfila = []
let clientsIps={}
const pingTimeout = 20000;

let usingVm = {
  9999909: 'a'
}
let azUsingVm = {
  123456789812345: "BCG3-999999"
}
let azParadas
let paradas1
let googleListadas
let azureListadas
let nodesParadasPriority

proj = "kinetic-dogfish-316114"
zon = "southamerica-east1-c"



//app.use(cors({ origin: 'https://projeto.brightcloudgames.com.br', 'credentials': true }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(timeout("7s"))

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Ocorreu um erro!');
});

app.use(function(req, res, next) {
  if (!req.timedout) next();
}); 

require("./controllers/authController")(app);
require("./controllers/painelController")(app);
//require("./controllers/vmController")(app);
//require("./controllers/adminPanel")(app);

app.use(express.static(__dirname + "/views"))
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);



app.get("/getIp", async (req,res)=>{
  let useridd 
  const token = parseCookies(req.headers.cookie).token
  try {
    jwt.verify(token, authConfig.secret, (err, decoded) => {
      if (err) {
        return console.log(err)
      }
      useridd= decoded.id
    })
  } catch (err) {
    console.log(err)
  }

  console.log(criadas[useridd].ip)
  return res.send(criadas[useridd].ip)
})

app.post("/authApp", async (req,res)=>{
  let useridd 
  const token = req.body.token//parseCookies(req.headers.cookie).token
  //console.log("TENTANDO FAZER AUTH " + req.body)
  try {
    jwt.verify(token, authConfig.secret, (err, decoded) => {
      if (err) {
        return console.log(err)
      }
      useridd= decoded.id
      console.log(`${useridd} = Está tentando autenticar vm`)
    })
  } catch (err) {
    console.log(err)
  }

  console.log("AUTH DO USER "+useridd)
//curl https://35.199.91.221:47990/api/pin -H "Authorization: Basic YmNnOmJjZw==" --data-raw '{"pin": "9895"}' --insecure
    try{
      console.log(`curl https://${criadas[useridd].ip}:47990/api/pin -H "Authorization: Basic YmNnOmJjZw==" --data-raw '{"pin": "${req.body.pin}"}' --insecure`)
        b=await cmd(`curl https://${criadas[useridd].ip}:47990/api/pin -H "Authorization: Basic YmNnOmJjZw==" --data-raw '{"pin": "${req.body.pin}"}' --insecure`)
        console.log(b)
    }catch(err){
        console.log(err)
    }


    try{
      b=await cmd(`curl https://${fisicasCriadas[useridd].internalip}:47990/api/pin -H "Authorization: Basic YmNnOmJjZw==" --data-raw '{"pin": "${req.body.pin}"}' --insecure`)
        console.log(b)
    }catch(err){
      console.log(err)
    }
})

async function checkInactiveClients() {
  while (true){
    const currentTimestamp = Date.now();
    for (const ip in clientsIps) {
      if (currentTimestamp - clientsIps[ip] > pingTimeout) {
        try {
          Object.keys(criadas).forEach(index => {
              if (criadas[index].ip == ip) {
                delete criadas[index]
              }
            
          })
        } catch (err0) {
          console.log(err0)
        }
        
      }
    }

    await new Promise(r => setTimeout(r, 10000));
  }
}

checkInactiveClients()


app.get('/pingVm', (req, res) => {
  try{
    //return res.render("manutencao.html")
    const ipAddress = req.socket.remoteAddress;
    console.log(`IP do usuario: ${ipAddress}`)
    clientsIps[ipAddress]=Date.now()
    return res.sendStatus(200)


  }catch(err){
    console.log(err)
  }
});


app.get('/', (req, res) => {
  //return res.render("manutencao.html")
  const ipAddress = req.socket.remoteAddress;
  console.log(`Request para o site antigo. - IP: ${ipAddress}`)


  return res.redirect("https://grupobright.com")
});





const server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/archive/play.grupobright.com/privkey1.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/archive/play.grupobright.com/fullchain1.pem')
  //key: fs.readFileSync('./ssl/server.key'),
  //cert: fs.readFileSync('./ssl/server.cert')
}, app)


//const serverHttp = require('http').createServer(app);

const io = require("./sockets/socketio").init(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true
  }
})




let fisicaUserStatus = {}

async function startVm(node, vmid, digit) {
  let headersSelecionado
  if(digit=="3"){
    headersSelecionado=defaultPOSTOptions
  }else{
    headersSelecionado=defaultPOSTOptions2
  }
  try {
      await request.post(`https://servidor.brightcloudgames.com.br:809${digit}/api2/json/nodes/${node}/qemu/${vmid}/status/start`, headersSelecionado, (req, res) => {
      //console.log(res.body)
    })
  } catch (errinho) {
    console.log(errinho)
  }
}




async function fisicaListVM(sock, userid, game) {

  try {

    if (assinaturaSalvaPriority[userid] != true) {
      return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário não tem assinatura PRIORITY." })
    }

    console.log("CRIANDO VM FISICA -", userid, getTime())


    return new Promise(async (resolve) => {


      //global.creating[userid] = true

      const resposta = {}
      //console.log("CRIANDO FISICA!- ESTAGIO 2")


      if (assinaturaSalvaPriority[userid] != true) {
        return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário não tem assinatura PRIORITY." })
      }

      requestPromise("https://servidor.brightcloudgames.com.br:8093/api2/json/cluster/resources", defaultGETOptions).then(async (responsa) => {

        await new Promise(res => setTimeout(res, 8000));

        //console.log("CRIANDO FISICA!- ESTAGIO 3")
        //console.log(JSON.parse(responsa.body))
        const data = JSON.parse(responsa.body)["data"]
        let nodeVms = {}
        let nodesLivres = []
        let encontrado

        if (!filaFisica.includes(userid))
          filaFisica.push(userid)
        // console.log("CRIANDO FISICA!- ESTAGIO 4")

        for await (const x of data) {
          //console.log(x)

          //console.log("ITERACAO")

          if (x.type == "qemu") {
            if (x.node == "CLUSTER") {
              const vmid = x.id.split("qemu/")[1]
              if (vmid == userid) {
                encontrado = "CLUSTER"
                console.log("VM DO USURARIO ENCONTRADA NO CLUSTER -", userid, getTime())
              }
            }
          }


          if (x.type == "node" && x.status == "online") {
            if (x.node != "CLUSTER" )  {
              //if ( x.node != "sp10" ) {
              //console.log(x.node,1)
                if (nodeVms[x.node] != true) {
                  nodeVms[x.node] = false
                  nodesLivres.push(x.node)
                }
              //}
            }
          }

          if (x.type == "qemu") {
            let actual = x.id.split("qemu/")[1]
            //console.log(x)
            //console.log(x.node, x.status,actual,"asd")
            if (x.status == "running" ||x.status=="stopped") {
              //console.log(x.node,"is",x.status)
              if (x.node != "CLUSTER" )  {
                //if ( x.node != "sp10" ) {
                  if (actual == userid) {
                    encontrado = x.node
                  }
                  nodeVms[x.node] = true
                //}
              }
            }
          }
        };

        requestPromise("https://servidor.brightcloudgames.com.br:8094/api2/json/cluster/resources", defaultGETOptions2).then(async (responsa2) => {

          await new Promise(res => setTimeout(res, 8000));

          //console.log(responsa2.body)
          const dataf = JSON.parse(responsa2.body)["data"]

          for await (const x of dataf) {
            //console.log(x)

            //console.log("ITERACAO")

            if (x.type == "qemu") {
              if (x.node == "CLUSTER") {
                const vmid = x.id.split("qemu/")[1]
                if (vmid == userid) {
                  encontrado = "CLUSTER"

                }
              }
            }


            if (x.type == "node" && x.status == "online") {
              if (x.node != "CLUSTER" )  {
                //if ( x.node != "sp10" ) {
