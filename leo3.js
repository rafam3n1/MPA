
          global.creating[userid] = false
          global.userStatus[userid] = "NADA"
          return await io.to(reemoIds[userid]).emit("error", { "code": "Não foi possível criar seu disco. Se persistir, contate o suporte." })
        }*/
      }  
    }





    /*
        console.log("error tostringado: ", catchError.toString())
    
        if (catchError.toString().includes("Error:")) {
          // console.log("Erro criando disco: ",catchError)
    
          if (filaCriandoGoogle.indexOf(userid) > -1) { filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); } if (fila.indexOf(userid) > -1) { fila.splice(fila.indexOf(userid), 1) }
    
          global.creating[userid] = false
          global.userStatus[userid] = "NADA"
          return await io.to(reemoIds[userid]).emit("error", { "code": 2828 })
        }*/


    //console.log("disco criado")
    await io.to(reemoIds[userid]).emit("status", "Disco Criado")


    //Pegar selflink

    //console.log("selflink pego")

    //console.log("ANEXANDO DISCO.")
    await io.to(reemoIds[userid]).emit("status", "Configurando sua máquina")
    global.userStatus[userid] = "Configurando sua máquina"



    /*

    anexdisk = await cmd(`${segunda}gcloud compute instances attach-disk ${selectedVm} --disk=snap-${generatedName} --boot --zone ${zonaVm}`)
    if (anexdisk.toString().includes("Error:")) {
      console.log("Erro anexando disco: ", anexdisk, ` - ${userid}`)
      global.creating[userid] = false
      global.userStatus[userid] = "NADA"
      if (filaCriandoGoogle.indexOf(userid) > -1) { filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); } if (fila.indexOf(userid) > -1) { fila.splice(fila.indexOf(userid), 1) }

      ggsToDelete.indexOf(selectedVm);if (ggsToDelete.indexOf(selectedVm) > -1){ggsToDelete.indexOf(selectedVm).splice(ggsToDelete.indexOf(selectedVm),1)};
      return await io.to(reemoIds[userid]).emit("error", { "code": 73 })
    }
*/
    
    
    if (game != "bcg") {
      anexGameDisk = await cmd(`${segunda}gcloud compute instances attach-disk ${selectedVm} --disk=snap-${nomeDiskAnexado} --zone ${zonaVm}`)
      if (anexGameDisk.toString().includes("Error:")) {
        console.log("Erro anexando disco: ", anexdisk, ` - ${userid}`)
        global.creating[userid] = false
        global.userStatus[userid] = "NADA"
        if (filaCriandoGoogle.indexOf(userid) > -1) { filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); } if (fila.indexOf(userid) > -1) { fila.splice(fila.indexOf(userid), 1) }

        return await io.to(reemoIds[userid]).emit("error", { "code": "Não foi possível anexar seu disco. Se persistir, contate o suporte." })
      }
    }
    


    if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }



    //console.log("DISCO ANEXADO")
    await io.to(reemoIds[userid]).emit("status", "Disco Anexado")




      
      //console.log(startarvm)
    

    // console.log("VM INICIADA")


    await new Promise(res => setTimeout(res, 15000));

    await cmd(`${segunda}gcloud compute instances reset ${selectedVm} --zone ${zonaVm}`)
    //console.log("VM RESTARTADA")


    global.userStatus[userid] = "Quase lá"
    await io.to(reemoIds[userid]).emit("status", "Quase lá")


    await new Promise(res => setTimeout(res, 90000));

    let { stdout, stderr } = (await exec(`echo Y | ${segunda}gcloud compute reset-windows-password ${selectedVm} --user=bcg --zone=${zonaVm} --format="json"`))
    stdout = JSON.parse(stdout)
    //let {stdout,stderr }=await exec(`${segunda}gcloud compute instances describe ${selectedVm} --format='get(networkInterfaces[0].accessConfigs[0].natIP)' --zone=southamerica-east1-c`)
    //stdout=stdout.replaceAll(/\n/g, "")


    await new Promise(res => setTimeout(res, 120000));

    //console.log(stdout.trim(), `- ${userid}`)
    //b=b.toString().trim()
   

    global.globalUsing[userid] = selectedVm
    if (filaCriandoGoogle.indexOf(userid) > -1) { // only splice array when item is found
      filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); // 2nd parameter means remove one item only
    }




    if (global.userStatus[userid] == "Quase lá") {

      //stdout.ip_address
      if (stdout.ip_address.length > 7) {
        //if(stdout){


       

        await new Promise(res => setTimeout(res, 35000));


        
        if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); return await io.to(reemoIds[userid]).emit("error", { "code": "Já está na fila; VM já criada." }); }
        criadas[userid] = { 'ip': stdout.ip_address, "password": stdout.password, "vm": selectedVm, "type":"google" }
        hookLOGS.send(`VM DO ID: ${userid}:
IP: ${stdout.ip_address}
SENHA: ${stdout.password}
VM: ${selectedVm}
TIPO: Google
HORÁRIO GERADO: [${getTime()}]
====================================
            `)
        
        try {
          Object.keys(criadas).forEach(index => {
            if (index != userid) {
              if (criadas[index].ip == stdout.ip_address) {
                delete (criadas[index])
              }
            }
          })
        } catch (err0) {
          console.log(err0)
        }


        console.log("CRIADA GOOGLE - ", userid, " ", { 'ip': stdout.ip_address, "password": stdout.password, "vm": selectedVm, "type": "google", "url": streamURL })

        try{
        if (ggsToDelete.indexOf(selectedVm) > -1){ggsToDelete.indexOf(selectedVm).splice(ggsToDelete.indexOf(selectedVm),1)};
        }catch(err){console.log(err), ` - ${userid} erro parseado.`}

        global.creating[userid] = false
        global.userStatus[userid] = "NADA"



        return await io.to(reemoIds[userid]).emit("created", { 'ip': stdout.ip_address, "password": stdout.password, "url": streamURL })
      } else {

        if (filaCriandoGoogle.indexOf(userid) > -1) { filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); } if (fila.indexOf(userid) > -1) { fila.splice(fila.indexOf(userid), 1) }

        ggsToDelete.indexOf(selectedVm);if (ggsToDelete.indexOf(selectedVm) > -1){ggsToDelete.indexOf(selectedVm).splice(ggsToDelete.indexOf(selectedVm),1)};

        global.creating[userid] = false
        global.userStatus[userid] = "NADA"
        return io.to(reemoIds[userid]).emit("error", { "code": 15 })
      }
    } else {

      await cmd(`${segunda}compute instances stop ${selectedVm}`)
      //await cmd(`echo Y | gcloud compute instances delete ${selectedVm} --project serious-bearing-388518 --zone southamerica-east1-c --delete-disks=all`)

      
      if (filaCriandoGoogle.indexOf(userid) > -1) { // only splice array when item is found
        filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); // 2nd parameter means remove one item only
      }

      global.creating[userid] = false
      global.userStatus[userid] = "NADA"
      return io.to(reemoIds[userid]).emit("error", { "code": 10 })



    }
    //globalCreating[req.userId]=false



  } catch (errorr) {
    if (filaCriandoGoogle.indexOf(userid) > -1) { // only splice array when item is found
      filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(userid), 1); // 2nd parameter means remove one item only
    }

    if (fila.indexOf(userid) > -1) { // only splice array when item is found
      fila.splice(fila.indexOf(userid), 1); // 2nd parameter means remove one item only
    }

    if (ggsToDelete.indexOf(ggsProcessoCriar[userid]) > -1) { // only splice array when item is found
      ggsToDelete.splice(ggsToDelete.indexOf(ggsProcessoCriar[userid]), 1); // 2nd parameter means remove one item only
    }

    


    //ggsToDelete.indexOf(selectedVm);if (ggsToDelete.indexOf(selectedVm) > -1){ggsToDelete.indexOf(selectedVm).splice(ggindex,1)};

    console.log(errorr, ` - ${userid}`)
    global.creating[userid] = false
    global.userStatus[userid] = "NADA"
    delete global.globalUsing[userid]
    delete global.globalReemo[userid]
    delete usingVm[userid]
    return await io.to(reemoIds[userid]).emit("error", { "code": "Erro! Contate o suporte com seu email caso persistir." })
  }



}




async function filaAndar() {
  while (true) {
    filaCriandoGoogle.pop()
    filaCriandoAzure.pop()
    filaFisica.pop();
    await new Promise(res => setTimeout(res, 300000));
  }

}
filaAndar()

async function deletarDiscos() {
  while (true) {
    try {
      let diskList1 = JSON.parse(await cmd(`gcloud compute disks list --format json`))


      diskList1.forEach(async disk => {
        if (!disk.users) {
          if (!gamesList.includes(disk.name)) {
            console.log("Disco não esta anexado - ", disk.name)
            await cmd(`echo Y | gcloud compute disks delete ${disk.name} --zone=${disk.zone}`)
            await new Promise(res => setTimeout(res, 5000));
          }
        } else {
          console.log("Disco anexado - ", disk.name)
        }
      });

      /*
      let diskList2 = JSON.parse(await cmd(`docker run --rm --volumes-from gcloud-config gcr.io/google.com/cloudsdktool/google-cloud-cli gcloud compute disks list --format json`))


      diskList2.forEach(async disk => {
        if (!disk.users) {
          if (!gamesList.includes(disk.name)) {
            console.log("Disco não esta anexado - ", disk.name)
            await cmd(`echo Y | docker run --rm --volumes-from gcloud-config gcr.io/google.com/cloudsdktool/google-cloud-cli gcloud compute disks delete ${disk.name} --zone=${disk.zone}`)
            await new Promise(res => setTimeout(res, 5000));
          }
        } else {
          console.log("Disco anexado - ", disk.name)
        }
      });
      */
    } catch (err) {
      console.log(err)
    }

    await new Promise(res => setTimeout(res, 300000));
  }
}

deletarDiscos()

async function updateParadasGoogle() {
  while (true) {
    try {
      console.log("Atualizando VMS paradas - Google - ", getTime())
      let paradas = []

      let respon2 = (await cmd(`gcloud compute instances list --format=json`))

      JSON.parse(respon2).forEach(async vm => {

        if (vm.name != "bcg-image") {
          paradas.push(vm.name)
        }
      });

      paradas.sort(customSort)

      googleListadas = paradas
    } catch {

    }

    await new Promise(res => setTimeout(res, 60000));
  }
}

updateParadasGoogle()


async function schedulerAzure() {
  while (true){
    try{
  
      let vmsParadas=await cmd(`az vm list --resource-group brightcloud-app --show-details --query \"[?powerState=='VM deallocated' || powerState=='VM stopped'].id\" -o json`)
      JSON.parse(vmsParadas).forEach(async vm => {
       // console.log(vm)
        let nomevm = vm.split("/subscriptions/097b86af-d5dc-4dd3-8a5e-8cecbed0eb28/resourceGroups/brightcloud-app/providers/Microsoft.Compute/virtualMachines/")[1]
        await new Promise(res => setTimeout(res, 1800000));

        //let statusdavm=JSON.parse(await cmd(`az vm get-instance-view --name ${nomevm} --resource-group brightcloud-app --query instanceView.statuses[1] --output json`))

       //if(!statusdavm.displayStatus=="VM running"){
        console.log(await cmd(`az vm delete --name ${nomevm} --resource-group brightcloud-app --subscription 097b86af-d5dc-4dd3-8a5e-8cecbed0eb28 --yes`))
       //}
        
      });

    }catch(err){
      console.log(err)
    }



    try{
      let responnn = JSON.parse(await cmd(`az network public-ip list -g brightcloud-app --query \"[?(ipConfiguration==null)].id\" -o json`))

      console.log(responnn)
      
      responnn.forEach(async ip => {
        console.log(await cmd(`az network public-ip delete --ids ${ip}`))
      })
    }catch(err){console.log(err)}

    await new Promise(res => setTimeout(res, 300000));
  }
}

//schedulerAzure()


async function discosGoogle() {
  while (true) {
    try {
      console.log("Atualizando VMS paradas - Google - ", getTime())

      let respon2 = (await cmd(`gcloud compute instances list --filter='status:TERMINATED' --format=json`))

      JSON.parse(respon2).forEach(async vm => {

        if (vm.name != "bcg-01") {
          let instanced = JSON.parse(await cmd(`gcloud compute instances describe ${vm.name} --format=json --zone=southamerica-east1-c`))
          try {
            for (let disco of instanced.disks) {
              console.log("DISCO: " +disco.source.split("disks/")[1])
              if (disco.source.split("disks/")[1].startsWith("snap-")){
                try {
                  await cmd(`gcloud compute instances detach-disk ${vm.name} --disk ${disco.source.split("disks/")[1]} --zone=southamerica-east1-c`)
                } catch (err) {
                  console.log(err)
                }
              }
            }
          } catch (err) {
            console.log(err)
          }

        }
      });


    } catch {

    }

    await new Promise(res => setTimeout(res, 30000));
  }
}
discosGoogle()



async function updateParadas() {
  while (true) {
    try{
      console.log("Atualizando VMS paradas -- azure - ", getTime())

      let tempList = []

      let responnn = JSON.parse(await cmd(`az vm list -d -g brightcloud-app -d --output json`))

      responnn.forEach(async vm => {
        tempList.push(vm.name)
      })


      tempList=ordenarLista(tempList)

      azureListadas = tempList
      //azParadas=respon

      //console.log(azParadas)

    }catch(err){
      console.log(err)
    }
    await new Promise(res => setTimeout(res, 200000));
  }
}

updateParadas()

async function updateFisicasNodes() {
  while (true) {
    try {
      console.log("Atualizando VMS paradas -- priority - ", getTime())

      requestPromise("https://servidor.brightcloudgames.com.br:8093/api2/json/cluster/resources", defaultGETOptions).then(async (responsa) => {

        await new Promise(res => setTimeout(res, 8000));

        const data = JSON.parse(responsa.body)["data"]
        let nodeVms = {}
        let nodesLivres = []

        for await (const x of data) {
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
            if (x.status == "running") {
              //console.log(x.node,"is",x.status)
              if (x.node != "CLUSTER" )  {
                //if ( x.node != "sp10" ) {
                  nodeVms[x.node] = true
               // }
                  
              }
            }
          }
        };

        requestPromise("https://servidor.brightcloudgames.com.br:8094/api2/json/cluster/resources", defaultGETOptions2).then(async (responsa2) => {

          await new Promise(res => setTimeout(res, 8000));
          //console.log(responsa2.body)
          const dataf = JSON.parse(responsa2.body)["data"]

          for await (const x of dataf) {



            if (x.type == "node" && x.status == "online") {
              if (x.node != "CLUSTER" /*|| x.node != "sp10"*/ )  {
                //console.log(x.node,1)
                if (nodeVms[x.node] != true) {
                  nodeVms[x.node] = false
                  nodesLivres.push(x.node)
                }
              }
            }

            if (x.type == "qemu") {
              let actual = x.id.split("qemu/")[1]
              //console.log(x)
              //console.log(x.node, x.status,actual,"asd")
              if (x.status == "running") {
                //console.log(x.node,"is",x.status)
                if (x.node != "CLUSTER" /*|| x.node != "sp10" */)  {
                  nodeVms[x.node] = true
                }
              }
            }
          };





          

          nodesParadasPriority = nodesLivres.sort(customSort)


        }).catch((err) =>{console.log(err)})
      }).catch((err) =>{console.log(err)})
    } catch (err) {
      console.log(err)
    }
    await new Promise(res => setTimeout(res, 200000));

  }
}

updateFisicasNodes()

async function checkAssinatura(userid, sock) {
  let assin
  return new Promise((resolve) => {
    try {
      const uri = `https://grupobright.com/wc-api/v3/customers/${userid}/subscriptions`

    var options = {
        url: uri,
        auth: {
            user: "ck_6663ed4bebfbe26bc7d68c7a70d5c0863067c3c0",
            password: "cs_bee5827b2551cc525599d6e06afb61c2eaa66c48"
        }
    }

      request(options, async function (err, resposta, body) {
        if (err) {
          console.log(err)
        }

        try {

          //console.log(JSON.parse(body).customer_subscriptions)
          //console.log(JSON.parse(body).customer_subscriptions)
          let removed = body

          Object.keys(JSON.parse(removed).customer_subscriptions).forEach(async key => {
            const subs = JSON.parse(removed).customer_subscriptions[key].subscription

            //console.log(JSON.parse(body).customer_subscriptions[key].subscription.line_items[0])

            if (subs.status == "active" && subs.line_items[0].name.startsWith("BRIGHT BETA") || subs.status == "active" && subs.line_items[0].name.startsWith("BETA PARCEIROS") || subs.status == "active" && subs.line_items[0].name.startsWith("BRIGHT PRIORITY")) {
              console.log("Subscription Ativa -", userid, getTime())
              assin = true
              assinaturaSalva[userid] = true
              //return io.to(reemoIds[userid]).emit("assinatura", true)
              //return await io.to(reemoIds[userid]).emit("assinatura",true)
              return resolve(assin)
            }
            else {
              console.log("Sem subscription FISICA *check* ", ` - ${userid}`)
              //return await io.to(reemoIds[userid]).emit("assinatura",false)
            }
          })

        } catch {

          console.log("No subscription found", ` - ${userid}`)
          return resolve(assin)
        }
        //console.log(subs)


      })
    } catch (err) { console.log(err, ` - ${userid}`) }
  }).then(function (response) {
    try {


      //io.to(reemoIds[userid]).emit("del", assin)
      /*
      if (assin != true) {
        return sock.disconnect()
      }*/
    } catch {
      //jamndo
    }
  })

}




async function createVmAz(sock, userid, game) {
  console.log("Criando Azure-", userid, getTime())



  let idsLiberados=[5981,1011]


  if (disableAzure && !idsLiberados.includes(userid)) {
    return await io.to(reemoIds[userid]).emit("error", { "code": "A azure está em manutenção!" })
  }


  
  /*
  try {
    console.log(await cmd(`gcloud compute instances stop bcg-${userid} --zone=southamerica-east1-c`))
    console.log(`VM do ID: ${userid} encontradam, deletando`)
    //console.log(await cmd(`echo Y | gcloud compute instances delete ${nomeVm} --project serious-bearing-388518 --zone southamerica-east1-c --delete-disks=all`))
  } catch {
    //
  }
  */
  let generateddiskName = randomstring.generate({ length: 12, charset: 'alphabetic' }).toLowerCase();
  let generateGameDisk = randomstring.generate({ length: 12, charset: 'alphabetic' }).toLowerCase();
  const generatedPass = randomstring.generate({ length: 12 })//"BrightCloud**"//

  try{
    let statusdavm=JSON.parse(await cmd(`az vm get-instance-view --name bcg-${userid} --resource-group brightcloud-app --query instanceView.statuses[1] --output json`))

    if(statusdavm.displayStatus=="VM running"){

      //let vmDeallocated=false

       // while(!vmDeallocated){
          try {
            subs = "097b86af-d5dc-4dd3-8a5e-8cecbed0eb28"
            

            

            await cmd(`az vm stop --resource-group brightcloud-app --name bcg-${userid} --subscription ${subs} --skip-shutdown`)
            await cmd(`az vm deallocate --resource-group brightcloud-app --name bcg-${userid} --subscription ${subs}`)

            vmstatus = JSON.parse(await cmd(`az vm get-instance-view --name bcg-${userid} --resource-group brightcloud-app --subscription ${subs} --query instanceView.statuses[1] --output json`))
    

    
            if (vmstatus.displayStatus == "VM deallocated") {
              await cmd(`az vm delete --name bcg-${userid} --resource-group brightcloud-app --yes`)
              await new Promise(res => setTimeout(res, 30000));
              vmDeallocated=true
            }


            await new Promise(res => setTimeout(res, 5000));
          } catch(erro){
            console.log(erro, ` - ${userid}`)
            await new Promise(res => setTimeout(res, 5000));
          }
      // }
    }
  }catch(err){
    console.log(err,` - ${userid}`)
  }
   /*
  try{
    console.log(azureListadas.length)
  }catch(err){
    console.log(err)
    return await io.to(reemoIds[userid]).emit("error", { "code": "Azure não listada" })
  }*/


  if (filaCriandoAzure.includes(userid) || filaCriandoGoogle.includes(userid) || criadas[userid] || fisicasCriadas[userid] || filaFisica.includes(userid)) {

    return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." })
  }

  if (!azfila.includes(userid))
    azfila.push(userid)


  if (filaFisica.indexOf(userid) > -1) { // only splice array when item is found
    filaFisica.splice(filaFisica.indexOf(userid), 1); // 2nd parameter means remove one item only
  }


  if (game == "reddead-" || game == "gtav-" || game == "rleague-") {
    game = game + "epic"
  }

  if (!gamesList.includes(game)) {
    return await io.to(reemoIds[userid]).emit("error", { "code": "Jogo não existente parceiro." })
  }

  /*
  if (global.globalCreating[userid]==true)
  {
    console.log(`Tentou iniciar maquina já estando criando outra AZURE - ${userid}`)
    return await io.to(sock.id).emit("error",{"code":3})
  }*/






  try {











    //console.log(`CREATE VM: ${usingVm}`)
    if (!game) {
      console.log("Sem jogo definido - ", userid)
      if (azfila.indexOf(userid) > -1) { // only splice array when item is found
        azfila.splice(azfila.indexOf(userid), 1); // 2nd parameter means remove one item only
      }
      if (filaCriandoAzure.indexOf(userid) > -1) { // only splice array when item is found
        filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
      }
      return await io.to(reemoIds[userid]).emit("error", { "code": 30 })
    }

    /*
    console.log(`${userid} não esta usando nenhuma maquina.`)

    if(!azParadas[azfila.indexOf(userid)]){
      console.log("RETORNANDO FILA - ",userid)
      return await io.to(reemoIds[userid]).emit("fila",{"position":(azfila.indexOf(userid)-azParadas.length)})
    }*/



    if (game.startsWith("gtav-")) {
      if (!game.split('gtav-')[1]) {
        game = 'gtav-epic'
      }
    }

    if (game.startsWith("rleague-")) {
      if (!game.split('rleague-')[1]) {
        game = 'rleague-epic'
      }
    }

    /*
    if (filaCriandoAzure.length == azParadas.length) {
      return await io.to(reemoIds[userid]).emit("fila", { "position": azfila.indexOf(userid) })
    }*/

    if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }

    //USUARIO ENTRA NA FILA DE CRIAR VM

    
    filaCriandoAzure.push(userid)

    if (azfila.indexOf(userid) > -1) { // only splice array when item is found
      azfila.splice(azfila.indexOf(userid), 1); // 2nd parameter means remove one item only
    }


    global.userStatus[userid] = "Sente-se e relaxe enquanto preparamos tudo pra você"
    await io.to(reemoIds[userid]).emit("status", "Sente-se e relaxe enquanto preparamos tudo pra você")

    let vmSelecionada=`bcg-${userid}`
    /*
    try{
      vmSelecionada="bcg-"+(formatNumber(Number(azureListadas[azureListadas.length-1].split("-")[1])+1))
    }catch(err)
    {
      vmSelecionada="bcg-01"
    }
     
    azureListadas.push(vmSelecionada)**/
    let subs = "097b86af-d5dc-4dd3-8a5e-8cecbed0eb28"



    console.log(`Criando VM e DISCO = ${userid}`)
    console.log(await cmd(`az disk create --resource-group brightcloud-app --name ${vmSelecionada} --sku Standard_LRS --size-gb 256 --source bcg`))
    console.log(await cmd(`az vm create --resource-group brightcloud-app --name ${vmSelecionada} --location brazilsouth --nic-delete-option delete --os-disk-delete-option delete --priority Spot --eviction-policy Deallocate --size Standard_NC4as_T4_v3 --attach-os-disk ${vmSelecionada} --os-type windows --nsg bright-app`))
    //console.log(await cmd(`az vm stop --resource-group brightcloud-app --name ${vmSelecionada} --skip-shutdown`))
    console.log(await cmd(`az vm deallocate --resource-group brightcloud-app --name ${vmSelecionada}`))

    //global.globalCreating[userid]=true

    /*
    let encontradoVm=false
    let vmSelecionada
    let subs


    while (!encontradoVm){
      try{
        if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); return await io.to(reemoIds[userid]).emit("error", { "code": 5410 }); }
        vmSelecionada = azParadas[filaCriandoAzure.indexOf(userid)]
        

    
        console.log(`Fila: ${filaCriandoAzure.length} == VMs Disponíveis:${azParadas.length} == vmSelecionada: ${vmSelecionada} == ${userid}`)
        await io.to(reemoIds[userid]).emit("status", "Você está na fila")
        global.userStatus[userid] = "Você está na fila"

        if (vmSelecionada) {
          subs = "097b86af-d5dc-4dd3-8a5e-8cecbed0eb28"
          encontradoVm=true
        } 

        global.creating[userid] = true
        await new Promise(res => setTimeout(res, 5000));
      }catch(err){
        console.log(err)
        await new Promise(res => setTimeout(res, 5000));
      }
    }

    if (azParadas.indexOf(vmSelecionada) > -1) {
      azParadas.splice(vmSelecionada, 1)
    }

    const index2 = azParadas.indexOf(azParadas[filaCriandoAzure.indexOf(userid)]);
    if (index2 > -1) { // only splice array when item is found
      azParadas.splice(index2, 1); // 2nd parameter means remove one item only
    }*/

    //console.log(vmSelecionada)
    

    //console.log("Maquina selecionada: ",vmSelecionada)
    await new Promise(res => setTimeout(res, 90000));
    vmstatus = JSON.parse(await cmd(`az vm get-instance-view --name ${vmSelecionada} --resource-group brightcloud-app --query instanceView.statuses[1] --output json`))
    //console.log(vmstatus)

    
    

    if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila."}); }

    await io.to(reemoIds[userid]).emit("status", "Preparando sua máquina")
    global.userStatus[userid] = "Preparando sua máquina"

    try{
      if (filaCriandoGoogle.includes(userid) || fila.includes(userid)){

        if (azParadas.indexOf(userid) > -1) { // only splice array when item is found
          azParadas.splice(azParadas.indexOf(userid), 1); // 2nd parameter means remove one item only
        }

        if (filaCriandoAzure.indexOf(userid) > -1) { // only splice array when item is found
          filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
        }

        return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." })

      }
    }catch{
      
    }

    /*
    b = await cmd(`az vm list --subscription ${subs} -o json`)

    try {
      for (let vmz of JSON.parse(b)) {
        //console.log(vm.name)
        discosDaVm = vmz.storageProfile.dataDisks
        //console.log(discosDaVm)
        //console.log(discosDaVm)
        if (vmz.name == vmSelecionada) {
          console.log(vmz.name)
          try {
            for (let disco of discosDaVm) {
              try {
                await cmd(`az vm disk detach -g brightcloud-app --vm-name ${vmSelecionada} --name ${disco.name} --subscription ${subs}`)
              } catch (err) {
                //
              }
            }
          } catch (err) {
            console.log(err)
          }
        }

        //console.log(vm.storageProfile.dataDisks)
      }
    } catch (err) {
      //
    }*/

/*
    try {
      diskCreate = await cmd(`az disk create -g brightcloud-app -n snap-${generateddiskName} --subscription ${subs} --sku Standard_LRS --source /subscriptions/${subs}/resourceGroups/brightcloud-app/providers/Microsoft.Compute/snapshots/bcg --location brazilsouth`)
      if (diskCreate.includes("error")) {
        diskCreate = await cmd(`az disk create -g brightcloud-app -n snap-${generateddiskName} --subscription ${subs} --sku Standard_LRS --source /subscriptions/${subs}/resourceGroups/brightcloud-app/providers/Microsoft.Compute/snapshots/bcg --location brazilsouth`)
      }

    } catch { diskCreate = await cmd(`az disk create -g brightcloud-app -n snap-${generateddiskName} --subscription ${subs} --sku Standard_LRS --source /subscriptions/${subs}/resourceGroups/brightcloud-app/providers/Microsoft.Compute/snapshots/bcg --location brazilsouth`) }
*/

    if (game != "bcg") {
      try {
        diskCreategamr = await cmd(`az disk create -g brightcloud-app -n snap-${generateGameDisk} --subscription ${subs} --sku Standard_LRS --source /subscriptions/${subs}/resourceGroups/ADM/providers/Microsoft.Compute/disks/${game} --location brazilsouth`)
        if (diskCreategame.includes("error")) {
          diskCreategame = await cmd(`az disk create -g brightcloud-app -n snap-${generateGameDisk} --subscription ${subs} --sku Standard_LRS --source /subscriptions/${subs}/resourceGroups/ADM/providers/Microsoft.Compute/disks/${game} --location brazilsouth`)
        }

      } catch(ewr) {
        console.log(`${ewr} = ${userid}`)
       }
    }


    await io.to(reemoIds[userid]).emit("status", "Configurando sua máquina")
    global.userStatus[userid] = "Configurando sua máquina"

    /*
    try {
      update = await cmd(`az vm update -g brightcloud-app -n ${vmSelecionada} --subscription ${subs} --os-disk /subscriptions/${subs}/resourceGroups/brightcloud-app/providers/Microsoft.Compute/disks/snap-${vmSelecionada}`)
      if (update.toString().includes("error")) {
        if (azfila.indexOf(userid) > -1) { // only splice array when item is found
          filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
        }

        if (filaCriandoAzure.indexOf(userid) > -1) { // only splice array when item is found
          filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
        }

        sairVar[userid] = true
        global.creating[userid] = false
        global.userStatus[userid] = "NADA"
        return io.to(reemoIds[userid]).emit("error", { "code": 435 })
      }

    } catch (err) {
      //update = await cmd(`az vm update -g brightcloud-app -n ${vmSelecionada} --subscription ${subs} --os-disk /subscriptions/${subs}/resourceGroups/brightcloud-app/providers/Microsoft.Compute/disks/snap-${generateddiskName}`)
      console.log(err)
      if (azfila.indexOf(userid) > -1) { // only splice array when item is found
        filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
      }

      if (filaCriandoAzure.indexOf(userid) > -1) { // only splice array when item is found
        filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
      }

      sairVar[userid] = true
      global.creating[userid] = false
      global.userStatus[userid] = "NADA"
      return io.to(reemoIds[userid]).emit("error", { "code": 435 })
    }//console.log(update)*/



    if (game != "bcg") {
      try {
        update2 = await cmd(`az vm disk attach -g brightcloud-app --vm-name ${vmSelecionada} --name snap-${generateGameDisk} --subscription ${subs}`)
        if (update2.toString().includes("error")) {
          if (azfila.indexOf(userid) > -1) { // only splice array when item is found
            filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
          }

          if (filaCriandoAzure.indexOf(userid) > -1) { // only splice array when item is found
            filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
          }

          sairVar[userid] = true
          global.creating[userid] = false
          global.userStatus[userid] = "NADA"
          return io.to(reemoIds[userid]).emit("error", { "code": "Erro anexando disco." })
        }

      } catch (err) {
        //update = await cmd(`az vm update -g brightcloud-app -n ${vmSelecionada} --subscription ${subs} --os-disk /subscriptions/${subs}/resourceGroups/brightcloud-app/providers/Microsoft.Compute/disks/snap-${generateddiskName}`)
        console.log(err)
        if (azfila.indexOf(userid) > -1) { // only splice array when item is found
          filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
        }

        if (filaCriandoAzure.indexOf(userid) > -1) { // only splice array when item is found
          filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
        }

        sairVar[userid] = true
        global.creating[userid] = false
        global.userStatus[userid] = "NADA"
        return io.to(reemoIds[userid]).emit("error", { "code": "Erro anexando disco." })
      }//console.log(update)
    }




    await io.to(reemoIds[userid]).emit("status", "Iniciando sua máquina")
    global.userStatus[userid] = "Iniciando sua máquina"
    console.log("STARTANDO VM AZURE - ", userid, getTime())

    let vmIniciou=false
    

    while (!vmIniciou){

      try{
        if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }
        let startarvm = await cmd(`az vm start -g brightcloud-app -n ${vmSelecionada} --subscription ${subs}`)

        if (!startarvm.toString().includes("Error")){
          vmIniciou=true
        }
      }catch(err){
        //console.log(err, ` - ${userid}`)
      }

      await new Promise(res => setTimeout(res, 10000));
    }




    await io.to(reemoIds[userid]).emit("status", "Quase lá")
    global.userStatus[userid] = "Quase lá"


    //console.log("TROCANDO DE SENHA")
    changepass = await cmd(`az vm user update -n ${vmSelecionada} -g brightcloud-app -u BCG -p ${generatedPass} --subscription ${subs}`)
    //console.log(changepass)

    let ip = await cmd(`az vm show -d -g brightcloud-app -n ${vmSelecionada} --subscription ${subs} --query publicIps -o json`)
    //console.log(ip)

    if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }
    if (ip == '') {
      console.log("Erro do ip vazio")
      await cmd(`az vm restart -g brightcloud-app -n ${vmSelecionada} --subscription ${subs}`)
      ip = await cmd(`az vm show -d -g brightcloud-app -n ${vmSelecionada} --query publicIps -o json --subscription ${subs}`)
    }

    let ipnew = ip.replace(`"`, "")
    // console.log(ipnew)
    let newip = ipnew.replace(/\r?\n|\r/g, "")
    //console.log(newip)
    let newnewip = newip.replace(`"`, "")
    //console.log(newnewip)



    console.log({ "ip": newnewip, "password": generatedPass })





    if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }
    let streamURL = ''
    

    console.log("MAQUINA CRIADA/STARTADA COM SUCESSO - ", userid, getTime())


    azUsingVm[userid] = vmSelecionada
    global.globalUsing[userid] = vmSelecionada
    //console.log("USUARIO COM VM: ",global.globalUsing[userid])

    if (filaCriandoAzure.indexOf(userid) > -1) { // only splice array when item is found
      filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
    }


    if (global.userStatus[userid] == "Quase lá") {





      //await io.to(sock.id).emit("cookie",generateToken({"pc":JSON.parse(body2),"vm":vmSelecionada,"type":"azure"}))

      //pcSalvo[userid]={'ip':newnewip,"password":generatedPass,"vm":vmSelecionada,"type":"azure"}

      if (newnewip.length > 7) {

        if (sairVar[userid]) { delete sairVar[userid]; console.log(`${userid} saiu da fila - ${getTime()}`); return await io.to(reemoIds[userid]).emit("error", { "code": "O usuário já está na fila." }); }
        criadas[userid] = { 'ip': newnewip, "password": generatedPass, "vm": vmSelecionada, "type": "azure", "url": streamURL }
        hookLOGS.send(`VM DO ID: ${userid}:
IP: ${newnewip}
SENHA: ${generatedPass}
VM: ${vmSelecionada}
TIPO: Azure
HORÁRIO GERADO: [${getTime()}]
====================================
            `)
        try {
          Object.keys(criadas).forEach(index => {
            if (index != userid) {
              if (criadas[index].ip == (newnewip)) {
                delete (criadas[index])
              }
            }
          })
        } catch (err0) {
          console.log(err0)
        }

        if (filaCriandoAzure.indexOf(userid) > -1) {
          filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1);
        }

        global.creating[userid] = false
        global.userStatus[userid] = "NADA"



        return await io.to(reemoIds[userid]).emit("created", { 'ip': newnewip, "password": generatedPass, 'url': streamURL })
      }
    } else {
      //await cmd(`az vm stop --resource-group brightcloud-app --name ${vmSelecionada} --skip-shutdown`)
      //await cmd(`az vm deallocate --resource-group brightcloud-app --name ${vmSelecionada}`)
      global.creating[userid] = false
      global.userStatus[userid] = "NADA"
      return io.to(reemoIds[userid]).emit("error", { "code": 10 })
    }



  } catch (err) {
    console.log(err)
    delete global.globalCreating[userid]
    //delete global.globalUsing[userid]
    delete global.globalReemo[userid]
    delete azUsingVm[userid]


    if (azfila.indexOf(userid) > -1) { // only splice array when item is found
      azfila.splice(azfila.indexOf(userid), 1); // 2nd parameter means remove one item only
    }

    if (filaCriandoAzure.indexOf(userid) > -1) { // only splice array when item is found
      filaCriandoAzure.splice(filaCriandoAzure.indexOf(userid), 1); // 2nd parameter means remove one item only
    }

    global.creating[userid] = false
    global.userStatus[userid] = "NADA"
    console.log(`A VM NÃO PÔDE SER INICIADA - ${userid} - ${err}`)
    return io.to(reemoIds[userid]).emit("error", { "code": "A VM não pôde ser iniciada." })
  }
}



async function listVm(sock, userid, game) {
  /*
  console.log(game)
  let bunda = []

  console.log(`Usuario usando maquina: ${azUsingVm[userid]}  : ${global.globalUsing[userid]}`)
  
  if (azUsingVm[userid]|| global.globalUsing[userid])
      return await io.to(sock.id).emit("error",{"code":3})

  let respon=await cmd(`az vm list -d -g brightcloud-app --subscription 65e66f14-62c1-41c0-bdb0-d48e561e67dc --query "[?powerState=='VM deallocated'].name" -d --output json`)
        
  if (!Object.keys(respon).length>0){
    if (!azfila.includes(userid))
      azfila.push(userid)
          
    return await io.to(sock.id).emit("error",{"code":1,"position":azfila.indexOf(userid)})
  }

 JSON.parse(respon).forEach(key=>{
    if (global.globalUsing[userid]==key){
      console.log("Maquina que está sendo usada: ",key)
      delete azUsingVm[userid]
      delete global.globalUsing[userid]
      delete global.globalReemo[userid]
    }
    
    
  })
      
  if (!azfila.includes(userid))
    azfila.push(userid)

  console.log(JSON.parse(respon)[0])
  
  azParadas=JSON.parse(respon)

  console.log(`VMS PARADAS: ${azParadas}`)
  console.log(azfila)

  */
  return await io.to(reemoIds[userid]).emit("vms", azfila.indexOf(userid))
}

const vmFunctions = {
  "azureList": listVm,
  "azureCreateVM": createVmAz,
  "googleList": googleListVM,
  "googleCreateVM": googleCreateVm,
  "fisicaList": fisicaListVM,
  "fisicaCreateVM": criarFisica
}


EventEmitter.setMaxListeners(0)
io.setMaxListeners(30)

io.on("connection", async (socket) => {


  let chosen
  let id
  let user


  socket.on("testeBrabo", async (msg) => {
    console.log(msg, " ======================================================================")
  })

  socket.on("getVms", async (msg) => {
    try {
      let gg = 'Online'
      let azzz = 'Online'
      let pr = 'Carregando'
      try {
        gg = paradas1.length
      } catch (err) {
        //
      }
      try {
        azzz = azParadas.length
      } catch (err) {
        //
      }

      try {
        pr = nodesParadasPriority.length
      } catch (err) {
        //
      }
      return io.to(socket.id).emit("avaliable", { "google": gg, "azure": azzz, "priority": pr })
    } catch (err) {
      console.log(err)
    }
  })

  socket.on("discord", async (msg) => {
    try {
      jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
          return console.log(err)
        }
        return io.to(socket.id).emit("discord", decoded.discorduser)
      })
    } catch (err) {
      console.log(err)
    }
  })


  /*
  try {
    if (!parseCookies(socket.handshake.headers.cookie).token) {
      return //socket.disconnect()
    }
  } catch (err) {
    console.log(err)
    return// socket.disconnect()
  }

  //console.log(socket.handshake.headers.cookie)
  if (socket.handshake.headers.cookie == undefined) {
    io.to(socket.id).emit('private', `sefodeu`);
    return// socket.disconnect()
  }

  //console.log(parseCookies(socket.handshake.headers.cookie))

  let token

  console.log(socket.handshake.query)
  if(socket.handshake.query.token){
    token=socket.handshake.query.token
    console.log("TOKEN PASSADO ATRAVES DE =QUERY= =======================" + token)
  }else{
    token = parseCookies(socket.handshake.headers.cookie).token
  }*/


  

  socket.on("authenticate",async (msg) =>{

    //console.log("AUTENTICANDO"+msg)
    

    jwt.verify(msg, authConfig.secret,async (err, decoded) => {
      if (err) {
        io.to(socket.id).emit('private', ``);
        console.log(err)
        return socket.disconnect()
      }
      id = decoded.id
      user= decoded.user
      reemoIds[decoded.id] = socket.id

      
        if (global.userStatus[id] != "NADA" ) {
          if(global.userStatus[id] != undefined)
          {
            console.log("Recoonect = "+ global.userStatus[id])
            io.to(socket.id).emit('reconnect', global.userStatus[id]);
          }
        }
      

      if (criadas[id]) {
        io.to(socket.id).emit('criado', criadas[id]);
        console.log("Retornando maquina criada! -", id)
      } else {
        //
      }
    
    
      if (fisicasCriadas[id]) {
        try {
    
          if (fisicasCriadas[id].ip && fisicasCriadas[id].password) {
            console.log(`Retornando Máquina Fisica Existente - ${id}`)
            return await io.to(reemoIds[id]).emit("RecCreated", fisicasCriadas[id])
          } else {
            //
          }
    
        } catch (errorr) {
          console.log(errorr)
        }
      }
      //console.log(`LOGADO ATRAVÉS DO AUTHENTICATE ================= ${id} - ${user}`)

      
    await io.to(reemoIds[id]).emit("autenticado", true)
    })


  })

  



  socket.on("interromper", async (msg) => {

    console.log(msg)
    await io.to(reemoIds[id]).emit("teste", { "code": 222 })
    


    try {

      let digit = ''
      let porta
      let numeroMigrate = ''
      let headersSelecionado

      if (fisicasCriadas[id]) {
      try{
        let numeroEstrelas=parseInt(msg.stars.split("star-")[1])
        let stringEstrelas=''
        for (let i = 0; i < numeroEstrelas; i++){
          stringEstrelas += ':star: '
        }
        hook.send(`
        ${stringEstrelas}
Usuário: ${user}

Serviço: Física
Feedback: ${msg.feedback}
        `)
      }catch(err){
        console.log(err)
      }
      let headersSelecionado
        if (fisicasCriadas[id].node.split("BCG")[1] >= 9) {
          porta = "2226"
          numeroMigrate = "2"
          digit = "4"
          headersSelecionado=defaultPOSTOptions2
        } else {
          porta = "2225"
          digit = "3"
          headersSelecionado=defaultPOSTOptions
        }

        requestPromise(`https://servidor.brightcloudgames.com.br:809${digit}/api2/json/nodes/${fisicasCriadas[id].node}/qemu/${id}/status/stop`, headersSelecionado).then(async (responsa) => {
          delete fisicasCriadas[id]
          await io.to(reemoIds[id]).emit("error", { "code": "" })
          await new Promise(res => setTimeout(res, 10000));
          return cmd(`ssh -p ${porta} root@servidor.brightcloudgames.com.br '/scripts/migrate${numeroMigrate}.sh ${id} CLUSTER'`)

        }).catch((err) =>{console.log(err)})
      }
    } catch (errinho) {
      console.log(errinho)
    }


    if (criadas[id]) {
      console.log(msg)
      
      let cachePc = criadas[id]
      let segunda = ''
      let nomeVm = cachePc.vm
      console.log(cachePc.vm, "==============================================================")
      let zoneVm

      let projectIdSelecionado = 'serious-bearing-388518'


      /*
      if (cachePc.vm.startsWith("SECOND")) {
        nomeVm = nomeVm.split("SECOND")[1]
        segunda = 'docker run --rm --volumes-from gcloud-config gcr.io/google.com/cloudsdktool/google-cloud-cli '
        projectIdSelecionado = 'digital-display-361820'
      }
*/

      delete criadas[id]
      delete global.globalUsing[id]
      await io.to(reemoIds[id]).emit("error", { "code": "" })



      if (cachePc.type == "google") {

        

        try{
        let numeroEstrelas=parseInt(msg.stars.split("star-")[1])
        let stringEstrelas=''
        for (let i = 0; i < numeroEstrelas; i++){
          stringEstrelas += ':star: '
        }
        hook.send(`
        ${stringEstrelas}
Usuário: ${user}

Serviço: Google
Feedback: ${msg.feedback}
        `)
      }catch(err){
        console.log(err)
      }
        try{
          if (ggsToDelete.indexOf(nomeVm) > -1){ggsToDelete.indexOf(nomeVm).splice(ggsToDelete.indexOf(nomeVm),1)};
        }catch(err){
          console.log(err)
        }
        try {
          console.log("Desligando pelo desligar: " +await cmd(`gcloud compute instances stop ${nomeVm} --zone=southamerica-east1-c`))
          //console.log(await cmd(`echo Y | gcloud compute instances delete ${nomeVm} --project serious-bearing-388518 --zone southamerica-east1-c --delete-disks=all`))
        } catch {
          //
        }

      }

      if (cachePc.type == "azure") {
      try{
        let numeroEstrelas=parseInt(msg.stars.split("star-")[1])
        let stringEstrelas=''
        for (let i = 0; i < numeroEstrelas; i++){
          stringEstrelas += ':star: '
        }
        hook.send(`
        ${stringEstrelas}
Usuário: ${user}

Serviço: Azure
Feedback: ${msg.feedback}
        `)
      }catch(err){
        console.log(err)
      }


        let subs
        let vmDeallocated=false

        /*
        while(!vmDeallocated){
          try {*/
            subsss = "097b86af-d5dc-4dd3-8a5e-8cecbed0eb28"
            

            

            try{
            await cmd(`az vm stop --resource-group brightcloud-app --name ${cachePc.vm} --subscription ${subsss} --skip-shutdown`)
            }catch(err){
              
            }

            await new Promise(res => setTimeout(res, 30000));
            try{
            await cmd(`az vm deallocate --resource-group brightcloud-app --name ${cachePc.vm} --subscription ${subsss}`)
            }catch(err){}

            //vmstatus = JSON.parse(await cmd(`az vm get-instance-view --name ${cachePc.vm} --resource-group brightcloud-app --subscription ${subsss} --query instanceView.statuses[1] --output json`))
    

            
            /*
            if (vmstatus.displayStatus == "VM deallocated") {
              await cmd(`az vm delete --name ${cachePc.vm} --resource-group brightcloud-app --yes`)
              vmDeallocated=true
            }*/


            //await new Promise(res => setTimeout(res, 5000));
          //} catch {
           // await new Promise(res => setTimeout(res, 5000));
          //}
       // }

      }

    }
  })



  socket.on("checarAssinatura", async (msg) => {

      console.log(`Usuário ${id} = está checando as assinaturas da física.`)
    
      jwt.verify(msg, authConfig.secret,async (err, decoded) => {
        if (err) {
          console.log(err)
          return;
        }
        
    
        if (decoded.id == id) {
          ativado=decoded.priorityativado
          console.log("RESPONSE ASSINATURA FISICA: ", ativado, ` - ${decoded.id}`)
          assinaturaSalvaPriority[id] = ativado
          return io.to(reemoIds[id]).emit("assinatura", ativado)
        }else{
          await io.to(reemoIds[id]).emit("error", "ta de sacanagem?");
          return socket.disconnect();
        }
      })
    
      /*
      //RETORNANDO RESPONSE DA CHECAGEM ASSINATURA
          console.log("RESPONSE ASSINATURA FISICA: ", response, ` - ${userid}`)
          assinaturaSalva[userid] = response
          return io.to(reemoIds[userid]).emit("assinatura", response)
          */
    
  })






  socket.on("deletarFisica",async (msg) => {
    try{
      let digit
      let headersSelecionado
      let headersPost

      if (fisicasCriadas[id].node.split("BCG")[1] >= 9) {
        digit = "4"
        headersSelecionado=defaultDELETEOptions2
        headersPost=defaultPOSTOptions2
      } else {
        digit = "3"
        headersSelecionado=defaultDELETEOptions
        headersPost=defaultPOSTOptions
      }

      requestPromise(`https://servidor.brightcloudgames.com.br:809${digit}/api2/json/nodes/${fisicasCriadas[id].node}/qemu/${id}/status/stop`, headersPost).then(async (responsee) => {
        await new Promise(res => setTimeout(res, 10000));
        requestPromise(`https://servidor.brightcloudgames.com.br:809${digit}/api2/extjs/nodes/${fisicasCriadas[id].node}/qemu/${id}?purge=1&destroy-unreferenced-disks=1`, headersSelecionado).then(async (responsa) => {
            console.log(responsa.body)
        })
      })

      
    }catch (errinho) {
        console.log(errinho, ` - ${id}`)
    }
    
  })





  //savedData=(JSON.parse(data.toString()))

  //console.log(savedData[id])

  

  /*
  if (fisicasCriadas[id]){
    if (fisicasCriadas[id].ip && fisicasCriadas[id].password) {
      console.log(`Retornando Máquina Fisica Existente - ${id}`)
      return await io.to(reemoIds[id]).emit("RecCreated", fisicasCriadas[id])
    } else {
      console.log(`Deletando fisica - ${id}`)
      delete fisicasCriadas[id]
    }
  }*/



  

  /*
  if (pcSalvo[id]){
    io.to(socket.id).emit('criado', pcSalvo[id]);
  }*/


  socket.on('deletar-fila', async (msg) => {

  })

  socket.on('auth', async (msg) => {
    try {
      console.log(msg)
      await cmd(`curl https://${criadas[id].ip}:47990/api/pin -H "Authorization: Basic YmNnOmJjZw==" --data-raw '{"pin": "${msg}"}' --insecure`)
      await io.to(reemoIds[id]).emit("authed", "true")
    } catch (error) {
      console.log(error)
    }

    try {
      console.log(msg)
      await cmd(`curl https://${fisicasCriadas[id].internalip}:47990/api/pin -H "Authorization: Basic YmNnOmJjZw==" --data-raw '{"pin": "${msg}"}' --insecure`)
      await io.to(reemoIds[id]).emit("authed", "true")
    } catch (error) {
      console.log(error)
    }
  })


  socket.on('deletar', async (msg) => {
    if (fisicasCriadas[id]) {

      try {
        let porta
        let numeroMigrate = ''
        let digit
        let cluster
        let headersSelecionado

        if (fisicasCriadas[id].node.split("BCG")[1] >= 9) {
          porta = "2226"
          numeroMigrate = "2"
          digit = "4"
          cluster = 2
          headersSelecionado=defaultPOSTOptions2
        } else {
          porta = "2225"
          digit = "3"
          cluster = 1
          headersSelecionado=defaultPOSTOptions
        }


        requestPromise(`https://servidor.brightcloudgames.com.br:809${digit}/api2/json/nodes/${fisicasCriadas[id].node}/qemu/${id}/status/stop`, headersSelecionado).then(async (responsa) => {
          delete fisicasCriadas[id]
          await new Promise(res => setTimeout(res, 300000));
          try {
            await cmd(`ssh -p 2225 root@servidor.brightcloudgames.com.br '/scripts/delvm.sh ${id}'`)
            await io.to(reemoIds[id]).emit("error", { "code": "" })
          } catch (err) {
            console.log(err)
          }

        }).catch((err) =>{console.log(err)})
      } catch (errinho) {
        console.log(errinho, ` - ${id}`)
      }






    }

  })





  socket.on("sair", async (msg) => {
    delete global.globalCreating[id]
    delete global.globalUsing[id]
    delete global.globalReemo[id]
    delete azUsingVm[id]
    delete pcSalvo[id]
    sairVar[id] = true
    //deletarCriado(id)


    await io.to(reemoIds[id]).emit("status", "Interrompendo sua máquina")
    global.userStatus[id] = "Interrompendo sua máquina"


    let digit = ''
    let headersSelecionado
    if (fisicasCriadas[id]) {

      if (fisicasCriadas[id].node.split("BCG")[1] >= 9) {
        digit = 4
        headersSelecionado=defaultPOSTOptions2
      } else {
        digit = 3
        headersSelecionado=defaultPOSTOptions
      }

      try {
        requestPromise(`https://servidor.brightcloudgames.com.br:809${digit}/api2/json/nodes/${fisicasCriadas[id].node}/qemu/${id}/status/stop`, headersSelecionado).then(async (responsa) => {
          delete fisicasCriadas[id]
          await io.to(reemoIds[id]).emit("error", { "code": "" })
          await new Promise(res => setTimeout(res, 10000));
          return

        }).catch((err) =>{console.log(err)})
      } catch (errinho) {
        console.log(errinho, `- ${id}`)
      }
    }

    try{
      try{
        console.log("Desligando pelo interromper: " + await cmd(`gcloud compute instances stop bcg-${id} --zone=southamerica-east1-c`))
      }catch{
        //
      }
      console.log(await cmd(`echo Y | gcloud compute instances delete bcg-${id} --project serious-bearing-388518 --zone southamerica-east1-c --delete-disks=all`))
    }catch(err){
      try{
        await cmd(`az vm stop --resource-group brightcloud-app --name bcg-${id} --subscription ${subs} --skip-shutdown`)
      }catch{

      }
      await cmd(`az vm deallocate --resource-group brightcloud-app --name bcg-${id} --subscription ${subs}`)
    }



    if (filaCriandoGoogle.indexOf(id) > -1) { // only splice array when item is found
      filaCriandoGoogle.splice(filaCriandoGoogle.indexOf(id), 1); // 2nd parameter means remove one item only
    }

    if (filaCriandoAzure.indexOf(id) > -1) { // only splice array when item is found
      filaCriandoAzure.splice(filaCriandoAzure.indexOf(id), 1); // 2nd parameter means remove one item only
    }


    if (filaFisica.indexOf(id) > -1) { // only splice array when item is found
      filaFisica.splice(filaFisica.indexOf(id), 1); // 2nd parameter means remove one item only
    }

    if (azfila.indexOf(id) > -1) {
      azfila.splice(azfila.indexOf(id), 1)
    }

    if (fila.indexOf(id) > -1) {
      fila.splice(fila.indexOf(id), 1)
    }

    global.userStatus[id] = "NADA"
    global.creating[id] = false


    await io.to(reemoIds[id]).emit("interrompido","")
  })


  socket.on("choose", async (msg) => {
    chosen = msg
    try {
      //checkAssinatura(id, socket)
    } catch {
      //
    }
  })

  //console.log(socket.handshake.headers.cookie)
  socket.on("vmCommand", async (msg) => {

    if (!id && !user){
      return socket.disconnect()
    }
    
    console.log(msg, ` - ${id}`)


    
    if (vmFunctions[chosen + msg.evento]) {
      //console.log(id)
      await vmFunctions[chosen + msg.evento](socket, id, msg.game)
    }


  })

})
//const io=require("socket.io")(server)


/*
const io=new Server(server,{cors:{origin:"https://4.2 28.193.142:443",path:"/ws"},})*/



server.setTimeout(20 * 60 * 1000)
server.maxConnections = 500

server.listen(8080,"0.0.0.0", function () {
  console.log("Express server listening on port 8080");
})

/*
serverHttp.listen(8443,"0.0.0.0", function () {
  console.log("Express server listening on port 8443");
})*/
/*
app.listen(443,() => {
    console.log(`Example app listening on port 443!`);
    console.log(`Network access via: ${ipAddress}:443!`);
  });*/
