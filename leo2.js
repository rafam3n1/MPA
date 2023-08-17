                  //console.log(x.node,1)
                  if (nodeVms[x.node] != true) {
                    nodeVms[x.node] = false
                    // if(x.node!='sp0'){
                    nodesLivres.push(x.node)
                    // }

                  }
               // }
              }
            }

            if (x.type == "qemu") {
              let actual = x.id.split("qemu/")[1]
              //console.log(x)
              //console.log(x.node, x.status,actual,"asd")
              if (x.status == "running") {
                //console.log(x.node,"is",x.status)
                if (x.node != "CLUSTER" )  {
                  //if ( x.node != "sp10" ) {
                    if (actual == userid) {
                      encontrado = x.node
                    }
                  //}
                  nodeVms[x.node] = true
                }
              }
            }
          };


          var customSort = function (a, b) {
            return (Number(a.match(/(\d+)/g)[0]) - Number((b.match(/(\d+)/g)[0])));
          }

          nodesLivres = nodesLivres.sort(customSort)


          let resposta = {
            "encontrado": encontrado,
            "nodesLivres": nodesLivres
          }



          //console.log("FUNCTION 1: ",resposta)


          return resolve(resposta)

        }).catch(errorinho => {
          console.log(errorinho)
        })


      }).catch((err) =>{console.log(err)})











    }).then(async function (response) {
      try {

        //console.log("RESPOSTA DO RESOLVE: ",response)

        const encontrado = response["encontrado"]
        const nodesLivres = response["nodesLivres"]




        if (encontrado != "CLUSTER" && encontrado ) {
          //console.log( "Maquina Rodando" )

          let porta
          let digit
          let numeroMigrate
          let headersSelecionado

          if (filaFisica.indexOf(userid) > -1) { // only splice array when item is found
            filaFisica.splice(filaFisica.indexOf(userid), 1); // 2nd parameter means remove one item only
          }

          if (encontrado.split("BCG")[1] >= 9) {
            porta = "2226"
            numeroMigrate = "2"
            digit = "4"
            headersSelecionado=defaultGETOptions2
          } else {
            porta = "2225"
            digit = "3"
            headersSelecionado=defaultGETOptions
          }

          let isIPReturned = false
          let ipSecondTry=false

          let ip
          let internalip
          let retry = 0
          while (!isIPReturned) {
            if (sairVar[userid]) { delete sairVar[userid]; if (filaFisica.indexOf(userid) > -1) {filaFisica.splice(filaFisica.indexOf(userid), 1);}; return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }
            console.log('Começou')
            try {
              console.log(`Tentando listar as vms = ${userid} = NODE: ${encontrado}`)
              await requestPromise(`https://servidor.brightcloudgames.com.br:809${digit}/api2/json/nodes/${encontrado}/qemu/${userid}/agent/network-get-interfaces`, headersSelecionado).then(async (respost) => {
                await new Promise(res => setTimeout(res, 2000))

                if (retry>=60){
                  /*
                  startVm(nodeAct, userid.toString(), digit)
                  await new Promise(res => setTimeout(res, 60000));*/
                  delete fisicaUserStatus[userid]
                    delete nodeUser[userid]
                    global.userStatus[userid] = "NADA"
                    global.creating[userid] = false
                    await io.to(reemoIds[userid]).emit("fisica-error", { "code": "O aplicativo não foi capaz de iniciar a VM. Contate o suporte." })
                    return await io.to(reemoIds[userid]).emit("error", { "code": "O aplicativo não foi capaz de iniciar a VM. Contate o suporte." })
                }
                
                //console.log(respost.body)
                let parsedData = await JSON.parse(respost.body)["data"].result
                parsedData.forEach(async element => {
                  if (element.name == "Ethernet") {
                    if (element["ip-addresses"][1]["ip-address"].includes("192.168")){
                      console.log(element["ip-addresses"][1]["ip-address"].split(".")[3])
                      internalip=element["ip-addresses"][1]["ip-address"]
                      ip = ('jogar.brightcloudgames.com.br:33' + element["ip-addresses"][1]["ip-address"].split(".")[3])
                      isIPReturned = true
                    }


                  }
                });

              }).catch((err) =>{console.log(err)})
            } catch (err) {
              retry = retry + 1
              console.log(`${userid} - Tentando IP - Retry: ${retry}`)
              console.log(err, ` - ${userid}`)
              if (err.toString().includes("does not exist") && retry > 20 || retry > 100) {
                delete fisicaUserStatus[userid]
                delete nodeUser[userid]
                global.userStatus[userid] = "NADA"
                global.creating[userid] = false
                return await io.to(reemoIds[userid]).emit("error", { "code": 425 })
              }
              await new Promise(res => setTimeout(res, 10000))
            }
          }


          let generatedPassword = randomstring.generate({ length: 8, charset: 'alphabetic' }).toLowerCase();


          let passouSenhaDefinir = false
          let trySenha = 0
          let userpass

          while (!passouSenhaDefinir) {
            if (sairVar[userid]) { delete sairVar[userid]; if (filaFisica.indexOf(userid) > -1) {filaFisica.splice(filaFisica.indexOf(userid), 1);}; return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }
            try {
              console.log(`ssh -p ${porta} root@servidor.brightcloudgames.com.br '/scripts/senha.sh ${encontrado} ${userid} ${generatedPassword}'`)
              userpass = await cmd(`ssh -p ${porta} root@servidor.brightcloudgames.com.br '/scripts/senha.sh ${encontrado} ${userid} ${generatedPassword}'`)
              userpass = JSON.parse(userpass)
              console.log("TEST: ", userpass)
              passouSenhaDefinir = true
            } catch (err) {
              trySenha = trySenha + 1
              console.log(err, ` - ${userid} - Tentativa SENHA: ${trySenha}`)
              await new Promise(res => setTimeout(res, 10000));
            }
          }


          

          if (filaFisica.indexOf(userid) > -1) { // only splice array when item is found
            filaFisica.splice(filaFisica.indexOf(userid), 1); // 2nd parameter means remove one item only
          }

          delete fisicaUserStatus[userid]
          delete nodeUser[userid]
          fisicasCriadas[userid] = { 'ip': ip ,'internalip':internalip, "password": userpass.password, "node": encontrado }

          global.userStatus[userid] = "NADA"
          global.creating[userid] = false
          return await io.to(reemoIds[userid]).emit("created", { 'ip': ip, 'internalip':internalip, "password": userpass.password, "fisica": true })
        }


        if (nodesLivres.length <= 0) {
          return await io.to(reemoIds[userid]).emit("fila", { "position": filaFisica.indexOf(userid) })
        }


        if (!encontrado) {
          console.log(`${userid} - Não tem Fisica em nenhum lugar. Criando Nova.. - ${getTime()}`)
          fisicaUserStatus[userid] = "criar"
          nodeUser[userid] = nodesLivres[filaFisica.indexOf(userid)]
          return await io.to(reemoIds[userid]).emit("fisica2", { "position": filaFisica.indexOf(userid) })

        }


        if (encontrado == 'CLUSTER') {
          fisicaUserStatus[userid] = "migrar"
          //console.log("FISICSA",userid.toString(),nodesLivres[filaFisica.indexOf(userid)])
          nodeUser[userid] = nodesLivres[filaFisica.indexOf(userid)]
          return await io.to(reemoIds[userid]).emit("fisica2", { "position": filaFisica.indexOf(userid) })
        }



      } catch (err) {
        //jamndo
        console.log(err, `- ${userid}`)
      }
    })
  } catch (errinho) {
    console.log(errinho, `- ${userid}`)
  }
}


async function criarFisica(sock, userid, game) {

  if (assinaturaSalvaPriority[userid] != true) {
    return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário não tem assinatura PRIORITY." })
  }


  let porta
  let numeroMigrate = ''
  let headersSelecionadoPOST
  let headersSelecionadoGET
  let digit = ''

  try {
    if (nodeUser[userid].split("BCG")[1] >= 9) {
      porta = "2226"
      numeroMigrate = "2"
      digit = "4"
      headersSelecionadoGET=defaultGETOptions2
      headersSelecionadoPOST=defaultPOSTOptions2
    } else {
      porta = "2225"
      digit = "3"
      headersSelecionadoGET=defaultGETOptions
      headersSelecionadoPOST=defaultPOSTOptions
    }
  } catch {
    return await io.to(reemoIds[userid]).emit("fila", { "position": filaFisica.indexOf(userid) })
  }

  try {

    if (assinaturaSalvaPriority[userid] != true) {
      return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário não tem assinatura PRIORITY." })
    }
  

    global.userStatus[userid] = "Sente-se e relaxe enquanto preparamos tudo pra você"
    if (fisicaUserStatus[userid] == "migrar") {
      console.log("Migrando VM FISICA -", userid, getTime())



      //console.log("Stage 1")
      let nodeAct = nodeUser[userid]
      //console.log(nodeAct)

      await new Promise(res => setTimeout(res, 15000));
      console.log(`ssh -p 2225 root@servidor.brightcloudgames.com.br '/scripts/migrate${numeroMigrate}.sh ${userid.toString()} ${nodeAct}'`)
      cmd(`ssh -p 2225 root@servidor.brightcloudgames.com.br '/scripts/migrate${numeroMigrate}.sh ${userid.toString()} ${nodeAct}'`)
      await new Promise(res => setTimeout(res, 30000));
      startVm(nodeAct, userid.toString(), digit)
      fisicasCriadas[userid] = { "node": nodeAct }


      //
      await new Promise(res => setTimeout(res, 60000));

      let isIPReturned = false
      let ipSecondTry=false

      let ip
      let internalip
      let retry = 0
      while (!isIPReturned) {

        if (retry>=60){
          /*
          startVm(nodeAct, userid.toString(), digit)
          await new Promise(res => setTimeout(res, 60000));*/
          delete fisicaUserStatus[userid]
            delete nodeUser[userid]
            global.userStatus[userid] = "NADA"
            global.creating[userid] = false
            await io.to(reemoIds[userid]).emit("fisica-error", { "code": "O aplicativo não foi capaz de iniciar a VM. Contate o suporte." })
            return await io.to(reemoIds[userid]).emit("error", { "code": "O aplicativo não foi capaz de iniciar a VM. Contate o suporte." })
        }
        console.log('Começou')
        if (sairVar[userid]) { delete sairVar[userid]; if (filaFisica.indexOf(userid) > -1) {filaFisica.splice(filaFisica.indexOf(userid), 1);}; return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }
        try {
          await requestPromise(`https://servidor.brightcloudgames.com.br:809${digit}/api2/json/nodes/${nodeAct}/qemu/${userid}/agent/network-get-interfaces`, headersSelecionadoGET).then(async (respost) => {
            await new Promise(res => setTimeout(res, 2000))

            //console.log(respost)
            let parsedData = await JSON.parse(respost.body)["data"].result
            parsedData.forEach(async element => {
              if (element.name == "Ethernet") {
                if (element["ip-addresses"][1]["ip-address"].includes("192.168")){
                  console.log(element["ip-addresses"][1]["ip-address"].split(".")[3])
                  internalip=element["ip-addresses"][1]["ip-address"]
                  ip = ('jogar.brightcloudgames.com.br:33' + element["ip-addresses"][1]["ip-address"].split(".")[3])
                  isIPReturned = true
                }


              }
            });

          }).catch((err) =>{console.log(err)})
        } catch (err) {
          retry = retry + 1
          console.log(`${userid} - Tentando IP - Retry: ${retry}`)
          if (err.toString().includes("does not exist") && retry > 20 || retry > 100) {
            delete fisicaUserStatus[userid]
            delete nodeUser[userid]
            global.userStatus[userid] = "NADA"
            global.creating[userid] = false
            return await io.to(reemoIds[userid]).emit("error", { "code": 425 })
          }
          await new Promise(res => setTimeout(res, 10000))
        }

      }


      //console.log("IP:",ip)




      let generatedPassword = randomstring.generate({ length: 8, charset: 'alphabetic' }).toLowerCase();

      let userpass

      let passouSenhaDefinir = false
      let trySenha = 0

      while (!passouSenhaDefinir) {
        if (sairVar[userid]) { delete sairVar[userid]; if (filaFisica.indexOf(userid) > -1) {filaFisica.splice(filaFisica.indexOf(userid), 1);}; return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }
        try {
          console.log(`ssh -p ${porta} root@servidor.brightcloudgames.com.br '/scripts/senha.sh ${nodeAct} ${userid} ${generatedPassword}'`)
          userpass = await cmd(`ssh -p ${porta} root@servidor.brightcloudgames.com.br '/scripts/senha.sh ${nodeAct} ${userid} ${generatedPassword}'`)
          userpass = JSON.parse(userpass)
          console.log("TEST: ", userpass)
          passouSenhaDefinir = true
        } catch (err) {
          trySenha = trySenha + 1
          console.log(err, ` - ${userid} - Tentativa SENHA: ${trySenha}`)
          await new Promise(res => setTimeout(res, 10000));
        }
      }


      if (filaFisica.indexOf(userid) > -1) { // only splice array when item is found
        filaFisica.splice(filaFisica.indexOf(userid), 1); // 2nd parameter means remove one item only
      }

      delete fisicaUserStatus[userid]
      delete nodeUser[userid]
      fisicasCriadas[userid] = { 'ip': ip, 'internalip':internalip, "password": userpass.password, "node": nodeAct }


      //sudo ssh -p 2225 root@servidor.brightcloudgames.com.br '/scripts/showip.sh sp0 6001'
      global.userStatus[userid] = "NADA"
      global.creating[userid] = false
      return await io.to(reemoIds[userid]).emit("created", { 'ip': ip,"internalip":internalip, "password": userpass.password, 'fisica': true })
    }

    if (fisicaUserStatus[userid] == "criar") {
      //console.log("O meninu n tem vm rodando PART 2")
      //console.log(nodeUser[userid])
      let nodeAct = nodeUser[userid]


      requestPromise(`https://servidor.brightcloudgames.com.br:8093/api2/json/nodes/CLUSTER/qemu/104/clone?newid=${userid}&target=CLUSTER`, defaultPOSTOptions).then(async (responsa) => {
        //console.log(responsa.statusMessage, `-  ${userid}`)
        await new Promise(res => setTimeout(res, 38000));

        cmd(`ssh -p 2225 root@servidor.brightcloudgames.com.br '/scripts/migrate${numeroMigrate}.sh ${userid.toString()} ${nodeAct}'`)
        await new Promise(res => setTimeout(res, 30000));
        startVm(nodeAct, userid.toString(), digit)
        fisicasCriadas[userid] = { "node": nodeAct }
        await new Promise(res => setTimeout(res, 60000));


        let isIPReturned = false
        let ipSecondTry=false

        let ip
        let internalip
        let retry = 0
        while (!isIPReturned) {
          console.log('Começou')

          if (retry>=60){
            /*
            startVm(nodeAct, userid.toString(), digit)
            await new Promise(res => setTimeout(res, 60000));*/
            delete fisicaUserStatus[userid]
              delete nodeUser[userid]
              global.userStatus[userid] = "NADA"
              global.creating[userid] = false
              await io.to(reemoIds[userid]).emit("fisica-error", { "code": "O aplicativo não foi capaz de iniciar a VM. Contate o suporte." })
              return await io.to(reemoIds[userid]).emit("error", { "code": "O aplicativo não foi capaz de iniciar a VM. Contate o suporte." })
          }

          if (sairVar[userid]) { delete sairVar[userid]; if (filaFisica.indexOf(userid) > -1) {filaFisica.splice(filaFisica.indexOf(userid), 1);}; return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }
          try {
            await requestPromise(`https://servidor.brightcloudgames.com.br:809${digit}/api2/json/nodes/${nodeAct}/qemu/${userid}/agent/network-get-interfaces`, headersSelecionadoGET).then(async (respost) => {
              await new Promise(res => setTimeout(res, 2000))
              let parsedData = await JSON.parse(respost.body)["data"].result
              parsedData.forEach(async element => {
                if (element.name == "Ethernet") {
                  if (element["ip-addresses"][1]["ip-address"].includes("192.168")){
                    console.log(element["ip-addresses"][1]["ip-address"].split(".")[3])
                    internalip=element["ip-addresses"][1]["ip-address"]
                    ip = ('jogar.brightcloudgames.com.br:33' + element["ip-addresses"][1]["ip-address"].split(".")[3])
                    isIPReturned = true
                  }


                }
              });

            }).catch((err) =>{console.log(err)})
          } catch (err) {
            retry = retry + 1
            console.log(`${userid} - Tentando IP - Retry: ${retry}`)
            if (err.toString().includes("does not exist") && retry > 20 || retry > 100) {
              delete fisicaUserStatus[userid]
              delete nodeUser[userid]
              global.userStatus[userid] = "NADA"
              global.creating[userid] = false
              return await io.to(reemoIds[userid]).emit("error", { "code": 425 })
            }
            await new Promise(res => setTimeout(res, 10000))
          }



          
        }
        //console.log("IP:",ip)

        let userpass

        let passouSenhaDefinir = false
        let trySenha = 0
        let generatedPassword = randomstring.generate({ length: 8, charset: 'alphabetic' }).toLowerCase();

        while (!passouSenhaDefinir) {
          if (sairVar[userid]) { delete sairVar[userid]; if (filaFisica.indexOf(userid) > -1) {filaFisica.splice(filaFisica.indexOf(userid), 1);}; return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }
          try {
            console.log(`ssh -p ${porta} root@servidor.brightcloudgames.com.br '/scripts/senha.sh ${nodeAct} ${userid} ${generatedPassword}'`)
            userpass = await cmd(`ssh -p ${porta} root@servidor.brightcloudgames.com.br '/scripts/senha.sh ${nodeAct} ${userid} ${generatedPassword}'`)
            userpass = JSON.parse(userpass)
            console.log("TEST: ", userpass)
            passouSenhaDefinir = true
          } catch (err) {
            trySenha = trySenha + 1
            console.log(err, ` - ${userid} - Tentativa SENHA: ${trySenha}`)
            await new Promise(res => setTimeout(res, 10000));
          }
        }


        if (filaFisica.indexOf(userid) > -1) { // only splice array when item is found
          filaFisica.splice(filaFisica.indexOf(userid), 1); // 2nd parameter means remove one item only
        }

        delete fisicaUserStatus[userid]
        delete nodeUser[userid]
        try {
          fisicasCriadas[userid] = { 'ip': ip, 'internalip':internalip, "password": userpass.password, "node": nodeAct }

          global.userStatus[userid] = "NADA"
          global.creating[userid] = false
          return await io.to(reemoIds[userid]).emit("created", { 'ip': ip, "internalip":internalip, "password": userpass.password, "fisica": true })
        } catch (err) {
          console.log(`${err} - ${userid}`)
        }
      }).catch((err) =>{console.log(err)})


    }
  } catch (err) {

    console.log(err, `- ${userid}`)

    if (filaFisica.indexOf(userid) > -1) { // only splice array when item is found
      filaFisica.splice(filaFisica.indexOf(userid), 1); // 2nd parameter means remove one item only
    }

    delete fisicaUserStatus[userid]
    delete nodeUser[userid]
    global.userStatus[userid] = "NADA"
    global.creating[userid] = false
    return await io.to(reemoIds[userid]).emit("error", { "code": "Erro! Contate o suporte com seu email caso persistir." })

  }


}









async function googleListVM(sock, userid, game) {


  //.log(paradas1)
  console.log(`${userid} - Listando VMS Google - ${getTime()}`)
  return await io.to(reemoIds[userid]).emit("vms", { "position": (fila.indexOf(userid)), "type": "google" })
}



async function googleCreateVm(sock, userid, game) {

  let idsLiberados=[5981,1011]


  if (disableGoogle && !idsLiberados.includes(userid)) {
    return await io.to(reemoIds[userid]).emit("error", { "code": "A google está em manutenção. Tente novamente mais tarde." })
  }


  /*
  

  try{
    await cmd(`az vm stop --resource-group brightcloud-app --name bcg-${userid} --skip-shutdown`)
    console.log(`VM do ID: ${userid} encontrada, deletando`)
  }catch(err){
    //
  }

  try{
    
  await cmd(`az vm deallocate --resource-group brightcloud-app --name bcg-${userid}`)
   
  }catch(err){
    //
  }*/


  if (filaCriandoAzure.includes(userid) || filaCriandoGoogle.includes(userid) || criadas[userid] || fisicasCriadas[userid] || filaFisica.includes(userid)) {
    return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." })
  }


  /*
  if(googleListadas.length==0){
    return await io.to(reemoIds[userid]).emit("error", { "code": "Google não listada" })
  }*/


  if (!fila.includes(userid))
    fila.push(userid)

  if (filaFisica.indexOf(userid) > -1) { // only splice array when item is found
    filaFisica.splice(filaFisica.indexOf(userid), 1); // 2nd parameter means remove one item only
  }

  if (game == "reddead-" || game == "gtav-" || game == "rleague-") {
    game = game + "epic"
  }

  if (!gamesList.includes(game)) {
    return await io.to(reemoIds[userid]).emit("error", { "code": "Jogo não existente." })
  }


  try {


    if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }



    let segunda = ''

    /*
    if (userid!=6001)
      return await io.to(reemoIds[userid]).emit("error",{"code":666})  */

    //console.log(global.globalUsing[userid])



    //console.log(`CREATE VM: ${usingVm}`)
    /*
    if (!paradas1 || !game) {
      console.log("Sem Google disponiveis")
      return await io.to(reemoIds[userid]).emit("error", { "code": 3 })
    }*/

    if (global.globalUsing[userid] != undefined) {
      console.log("Linha 599 - index.js - ", userid, " - ", global.globalUsing[userid])
      delete global.globalUsing[userid]
      return await io.to(reemoIds[userid]).emit("error", { "code": 3 })

    }

    
   

    await io.to(reemoIds[userid]).emit("status", "Sua máquina está sendo criada")
    global.userStatus[userid] = "Sua máquina está sendo criada"

    let selectedVm=`bcg-${userid}`
    /*
    try{
      selectedVm="bcg-"+(formatNumber(Number(googleListadas[googleListadas.length-1].split("bcg-")[1])+1))
    }catch{
      selectedVm="bcg-01"
    }
    googleListadas.push(selectedVm)*/
    




  
    await new Promise(res => setTimeout(res, 30000));
    //statusdavm = JSON.parse(await cmd(`gcloud compute instances describe ${selectedVm} --format=json --zone=southamerica-east1-c`))

    
    
    let listagemVms = (await cmd(`gcloud compute instances list --format=json`))

    let continuar=true
    let vmEncontrada=false

    var loopChecarVmCriada=await new Promise(async (resolve, reject) => {
      await JSON.parse(listagemVms).forEach(async vm => {
        if (vm.name==selectedVm){
          await io.to(reemoIds[userid]).emit("status", "Sua máquina está sendo iniciada")
          global.userStatus[userid] = "Sua máquina está sendo iniciada"
          /*
          let instanced = JSON.parse(await cmd(`gcloud compute instances describe ${selectedVm} --format=json --zone=southamerica-east1-c`))
          try {
            for (let disco of instanced.disks) {
              console.log("DISCO: " +disco.source.split("disks/")[1])
              if (disco.source.split("disks/")[1].startsWith("snap-")){
                try {
                  await cmd(`gcloud compute instances detach-disk ${selectedVm} --disk ${disco.source.split("disks/")[1]} --zone=southamerica-east1-c`)
                } catch (err) {
                  console.log(err, ` - ${userid}`)
                }
              }
            }
          } catch (err) {
            console.log(err, ` - ${userid}`)
          }
          
          await new Promise(res => setTimeout(res, 60000));*/
          vmEncontrada=true
          try{

            await cmd(`${segunda}gcloud compute instances start ${selectedVm} --zone=southamerica-east1-c`)
          }catch(err){
            console.log(`${err} === Não foi possível iniciar vm existente da google = ${userid} = `)
          }
            await new Promise(res => setTimeout(res, 35000));
      
            let { stdout, stderr } = (await exec(`echo Y | gcloud compute reset-windows-password ${selectedVm} --user=bcg --zone=southamerica-east1-c --format="json"`))
            stdout = JSON.parse(stdout)
            
            if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); return await io.to(reemoIds[userid]).emit("error", { "code": "Já está na fila; VM já criada." }); }
            criadas[userid] = { 'ip': stdout.ip_address, "password": stdout.password, "vm": selectedVm, "type":"google" }
      
            continuar=false

            hookLOGS.send(`VM DO ID: ${userid}:
IP: ${stdout.ip_address}
SENHA: ${stdout.password}
VM: ${selectedVm}
TIPO: Google
HORÁRIO GERADO: [${getTime()}]
====================================
            `)
            
      
            
      
      
            console.log("CRIADA GOOGLE - ", userid, " ", { 'ip': stdout.ip_address, "password": stdout.password, "vm": selectedVm, "type": "google", "url": "" })

      
            try{
            if (ggsToDelete.indexOf(selectedVm) > -1){ggsToDelete.indexOf(selectedVm).splice(ggsToDelete.indexOf(selectedVm),1)};
            }catch(err){console.log(err), ` - ${userid} erro parseado.`}
      
            global.creating[userid] = false
            global.userStatus[userid] = "NADA"
      
      
      
            return await io.to(reemoIds[userid]).emit("created", { 'ip': stdout.ip_address, "password": stdout.password, "url": "" })
      
      
            

        }

      })
      resolve();
    })


 

    /*
    loopChecarVmCriada.then(()=>{
      console.log("VM CRIADA")
    })
*/
    if(vmEncontrada){
      /*
      delete global.globalUsing[userid]
      global.creating[userid]=false
      global.userStatus[userid]="NADA"*/
      return //await io.to(reemoIds[userid]).emit("error",{"code":"Teste."})  
    }
    
//gcloud compute instances describe bcg-10926 --format=json --zone=southamerica-east1-c
    /*
    let vmCCache=paradas1[filaCriandoGoogle.indexOf(userid)]
    console.log(paradas1[filaCriandoGoogle.indexOf(userid)], ` - ${userid} - MAQUINA SELECIONADA -`)
    let zonaVm = paradas1[filaCriandoGoogle.indexOf(userid)].split("%")[1]
    console.log(zonaVm)
    let selectedVm = paradas1[filaCriandoGoogle.indexOf(userid)].split("%")[0]
    */

    ggsProcessoCriar[userid]=selectedVm

    ggsToDelete.push(selectedVm)

    

    

    /*
    const index2 = paradas1.indexOf(paradas1[filaCriandoGoogle.indexOf(userid)]);
    if (index2 > -1) { // only splice array when item is found
      paradas1.splice(index2, 1); // 2nd parameter means remove one item only
    }
*/
    let extraVM = ''
    let streamURL=''
    let zonaSelecionada

    
    let projectIdSelecionado = 'serious-bearing-388518'
   //let projectIdSelecionado = 'kinetic-dogfish-316114'


   //try{
    let tentandoCriar= (await cmd(`gcloud beta compute instances create ${selectedVm} --enable-display-device --project serious-bearing-388518 --zone southamerica-east1-c --machine-type custom-16-16384 --accelerator type=nvidia-tesla-t4,count=1 --image bcg --preemptible --min-cpu-platform="Intel Skylake"`))
    zonaSelecionada="southamerica-east1-c"

    if (tentandoCriar.includes("ZONE_RESOURCE_POOL_EXHAUSTED_WITH_DETAILS")){
      zonaSelecionada="southamerica-east1-a"
      console.log(await cmd(`gcloud beta compute instances create ${selectedVm} --enable-display-device --project serious-bearing-388518 --zone southamerica-east1-a --machine-type custom-16-16384 --accelerator type=nvidia-tesla-t4,count=1 --image bcg --preemptible --min-cpu-platform="Intel Skylake"`))
    }
  
  /*}catch(err){
    console.log(`Erro criando vm da google - ${userid} = Tentando criar em nova zona`)
    console.log(await cmd(`gcloud beta compute instances create ${selectedVm} --enable-display-device --project kinetic-dogfish-316114 --zone southamerica-east1-a --machine-type custom-16-16384 --accelerator type=nvidia-tesla-t4,count=1 --image bcg --preemptible --min-cpu-platform="Intel Skylake"`))
    zonaSelecionada="southamerica-east1-a"
   }*/
    await new Promise(res => setTimeout(res, 30000));
   //console.log(await cmd(`gcloud compute instances stop ${selectedVm} --zone=${zonaSelecionada}`))
   //await new Promise(res => setTimeout(res, 60000));


  let zonaVm =zonaSelecionada

    
    if (selectedVm==undefined){
      
      delete global.globalUsing[userid]
      global.creating[userid]=false
      global.userStatus[userid]="NADA"
      return await io.to(reemoIds[userid]).emit("error",{"code":3})  
    }



    //global.globalCreating[req.userId]=true


    global.creating[userid] = true






    await io.to(reemoIds[userid]).emit("status", "Sente-se e relaxe enquanto preparamos tudo pra você")
    global.userStatus[userid] = "Sente-se e relaxe enquanto preparamos tudo pra você"

    /*
    const [instanced] = await instancesClient.get({
      instance:selectedVm,
      project:proj,
      zone:zon
    })*/

    //const instanced = JSON.parse(await cmd(`${segunda}gcloud compute instances describe ${selectedVm} --format=json --zone=${zonaVm}`))

 

    /*
    if (instanced.status != "TERMINATED") {
      console.log("Maquina ja está rodando na hora de criar (google) - ", userid, getTime())
      //console.log("STATUS DA VM:  ",instanced.status)
      if (filaCriandoGoogle.indexOf(userid) > -1) { // only splice array when item is found
        filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); // 2nd parameter means remove one item only
      }
      //ggsToDelete.indexOf(selectedVm);if (ggsToDelete.indexOf(selectedVm) > -1){ggsToDelete.indexOf(selectedVm).splice(ggsToDelete.indexOf(selectedVm),1)};

      global.creating[userid] = false
      global.userStatus[userid] = "NADA"
      return await io.to(reemoIds[userid]).emit("error", { "code": "Maquina rodando: "+instanced.status })
    }*/
    
    if (filaCriandoAzure.includes(userid) || azfila.includes(userid)){

      if (paradas1.indexOf(userid) > -1) { // only splice array when item is found
        paradas1.splice(paradas1.indexOf(userid), 1); // 2nd parameter means remove one item only
      }

      if (filaCriandoGoogle.indexOf(userid) > -1) { // only splice array when item is found
        filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); // 2nd parameter means remove one item only
      }

      /*
      if (ggsToDelete.indexOf(selectedVm) > -1){
        ggsToDelete.indexOf(selectedVm).splice(ggsToDelete.indexOf(selectedVm),1)
      }
*/

      return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." })

    }

    if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); ggsToDelete.indexOf(selectedVm);if (ggsToDelete.indexOf(selectedVm) > -1){ggsToDelete.indexOf(selectedVm).splice(ggsToDelete.indexOf(selectedVm),1)}; return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }

    
    /*
    try {
      for (let disco of instanced.disks) {
        try {
          await cmd(`${segunda}gcloud compute instances detach-disk ${selectedVm} --disk ${disco.source.split("disks/")[1]} --zone=${zonaVm}`)
        } catch (err) {
          console.log(err, ` - ${userid}`)
        }
      }
    } catch (err) {
      console.log(err, ` - ${userid}`)
    }*/


    

    /*
    try {
      const diskNamee = instanced.disks[0].source.split(`https://www.googleapis.com/compute/v1/projects/${projectIdSelecionado}/zones/${zonaVm}/disks/`)[1]
      //console.log(diskNamee)


      await cmd(`${segunda}gcloud compute instances detach-disk ${selectedVm} --disk=${diskNamee} --zone=${zonaVm}`)

      //console.log("deletando disco")
      await io.to(reemoIds[userid]).emit("status", "Procurando máquina livre")
      global.userStatus[userid] = "Procurando máquina livre"


      await cmd(`echo Y | ${segunda}gcloud compute disks delete ${diskNamee} --zone=${zonaVm}`)

      //console.log("deletado!!")

    } catch {
      // console.log("sem disco")
    }

*/
    
    let generatedName = randomstring.generate({ length: 12, charset: 'alphabetic' }).toLowerCase();
    let nomeDiskAnexado = randomstring.generate({ length: 17, charset: 'alphabetic' }).toLowerCase();
    //console.log(`generated name: ${generatedName}`)

    //console.log("Criando disco..")
    await io.to(reemoIds[userid]).emit("status", "Preparando sua máquina")
    global.userStatus[userid] = "Preparando sua máquina"

    //GERAR DISCO COM SNAPSHOT


    /*
    let catchError = await cmd(`${segunda}gcloud compute disks create snap-${generatedName} --image bcg --zone=southamerica-east1-c --type=pd-ssd --zone=${zonaVm}`)
    console.log(catchError)

    if (catchError.toString().includes("SSD_TOTAL_GB")) {
      catchError = await cmd(`${segunda}gcloud compute disks create snap-${generatedName} --image bcg --zone=southamerica-east1-c --type=pd-standard --zone=${zonaVm}`)
    }*/


    
    global.userStatus[userid] = "Iniciando sua máquina"
    await io.to(reemoIds[userid]).emit("status", "Iniciando sua máquina")
    //LIGAR VM

    let prontoPraContinuar = false
    let skipsInts = 1


    /*

    while (!prontoPraContinuar){
      try {

        let startarvm = await cmd(`${segunda}gcloud compute instances start ${selectedVm} --zone ${zonaVm}`)
        prontoPraContinuar=true

      

      } catch (err) {


        if ((skipsInts) >= 100 ){
          console.log(err)
          if (filaCriandoGoogle.indexOf(userid) > -1) { filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); } if (fila.indexOf(userid) > -1) { fila.splice(fila.indexOf(userid), 1) }

          ggsToDelete.indexOf(selectedVm);if (ggsToDelete.indexOf(selectedVm) > -1){ggsToDelete.indexOf(selectedVm).splice(ggsToDelete.indexOf(selectedVm),1)};

          global.creating[userid] = false
          global.userStatus[userid] = "NADA"
          return io.to(reemoIds[userid]).emit("error", { "code": "Problema iniciando a VM. Contate o ticket"})
        }
        
        skipsInts++
        
        /*
        console.log(err)
        if (filaCriandoGoogle.indexOf(userid) > -1) { filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); } if (fila.indexOf(userid) > -1) { fila.splice(fila.indexOf(userid), 1) }

        ggsToDelete.indexOf(selectedVm);if (ggsToDelete.indexOf(selectedVm) > -1){ggsToDelete.indexOf(selectedVm).splice(ggsToDelete.indexOf(selectedVm),1)};

        global.creating[userid] = false
        global.userStatus[userid] = "NADA"
        return io.to(reemoIds[userid]).emit("error", { "code": "Problema iniciando a VM. Contate o ticket"})
      }

      await new Promise(res => setTimeout(res, 5000));
    }*/
    

    
    if (game != "bcg") {
      let discoJogo = await cmd(`${segunda}gcloud compute disks create snap-${nomeDiskAnexado} --image=${game} --zone ${zonaVm} --type=pd-standard`)
      console.log(discoJogo)

      if (discoJogo.toString().includes("SSD_TOTAL_GB")) {
        discoJogo = await cmd(`${segunda}gcloud compute disks create snap-${nomeDiskAnexado} --image=${game} --zone ${zonaVm} --type=pd-standard`)
      }

      if (discoJogo.toString().includes("Error:")) {
        /*
        if (!discoJogo.toString().includes("SSD_TOTAL_GB")) {
          if (filaCriandoGoogle.indexOf(userid) > -1) { filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); } if (fila.indexOf(userid) > -1) { fila.splice(fila.indexOf(userid), 1) }
