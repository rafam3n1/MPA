# MPA
 ## Mercado Pago Assinaturas

 Plugin para integrar assinaturas do Mercado Pago com o WooCommerce

 MP lançou uma função com API de assinaturas recorrentes.
 Como não atualizaram o Plugin do MP para com o WC Subscriptions com isso, fiz esse plugin conectando a API do MP Assinaturas.

 Ele é simples apenas para resolver meu caso, não está preparado para configurar facilmente.

 Ele cria uma endpoint na pg "minha-conta" do wordpress com um botão sincronizar, que é o oAuth com o MP com meu aplicativo criado lá dentro.

 Depois de oAuth ele pega o token do cliente do MP, com esse token, ele consulta a ID do cliente, com essa ID de cliente do MP Assinaturas, faz um consulta agora no Token do vendedor, consultando o status da assinatura dele e vinculando o mesmo ao user do wp.

 Com isso meus assinantes agora terão renovações automáticas direto no mercado pago, importe informar que da forma que estou fazendo o cliente gerencia sua assinatura direto no aplicativo dele do mercado pago, e é obrigatório ter uma conta no MP, se comprar como convidado não funciona o esquema e tem que vincular manualmente esse cliente.

 Quando vinculado aparece pro cliente na endpoint do "minha-conta", tambem aparece como campo personalizado dentro do user do wordpress.

 e ai para o meu caso, quando o status esta 'authorized' ele vincula esse cliente a uma 'membership' do plugin "wc-membership", com isso um cliente ativo tem acesso as paginas da associação 'membership'

 O Plugin registra todas as vinculações em um banco de dados 'wp-mpa-subscribers'

 Sobre as atualizações de status, é feito sempre que um shortcode é carregado, esse shortcode eu deixo nas minhas paginas bloqueadas pela 'membership' dessa forma sempre quando um cliente tenta entrar nas paginas é feita uma nova consulta sobre o status da assinatura dele.

 ###
 Não sou dev expert e foi o que consegui fazer até então, estou postando o plugin para que se alguem tiver interesse de contribuir com a finalização do plugin é bem-vindo. 
 Mas acredito que faria mais sentido um plugin que vincula essa nova funcionalidade do MP diretamente com o Wocommerce Subscription ou o plugin oficial de gateway do MP.