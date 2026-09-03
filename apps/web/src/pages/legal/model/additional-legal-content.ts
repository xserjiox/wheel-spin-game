import type { LegalDocument } from "./legal-content";

type LegalPair = { privacy: LegalDocument; cookies: LegalDocument };

const esGoogleLinks = [
  {
    label: "Cómo utiliza Google los datos de sitios asociados",
    href: "https://policies.google.com/technologies/partner-sites",
  },
  {
    label: "Política de Privacidad de Google",
    href: "https://policies.google.com/privacy",
  },
  {
    label: "Términos de Tratamiento de Datos de Google Ads",
    href: "https://business.safety.google/adsprocessorterms/",
  },
];

const ptGoogleLinks = [
  {
    label: "Como o Google usa dados de sites parceiros",
    href: "https://policies.google.com/technologies/partner-sites",
  },
  {
    label: "Política de Privacidade do Google",
    href: "https://policies.google.com/privacy",
  },
  {
    label: "Termos de Processamento de Dados do Google Ads",
    href: "https://business.safety.google/adsprocessorterms/",
  },
];

const es: LegalPair = {
  privacy: {
    eyebrow: "INFORMACIÓN LEGAL",
    title: "Política de privacidad",
    summary:
      "Esta política explica cómo GatherWheel trata los datos personales, incluidos los datos opcionales de Google Analytics.",
    effectiveDateLabel: "Fecha de entrada en vigor",
    controllerTitle: "1. Responsable y contacto",
    contactLabel: "Contacto de privacidad",
    controllerFallback:
      "El operador del servicio es el responsable del tratamiento. Antes del lanzamiento, el operador de producción debe publicar aquí su nombre legal y un contacto de privacidad.",
    sections: [
      {
        title: "2. Datos que tratamos",
        items: [
          "Datos de la sala que proporcionas: nombre visible, título de la sala, opciones de la ruleta, sugerencias, contraseña opcional, permisos, marcas de tiempo y resultados compartidos. Las contraseñas solo se almacenan como hashes unidireccionales de Argon2.",
          "Datos de sesión y seguridad: un token aleatorio de sesión de sala (en la base de datos solo se guarda su hash), registros temporales de IP en memoria para limitar intentos fallidos de acceso y registros HTTP operativos que puede crear el proveedor de alojamiento.",
          "Datos del dispositivo: idioma, accesos directos a salas, plantillas de ruleta y registro de consentimiento para analítica.",
          "Google Fonts recibe la dirección IP y los metadatos HTTP habituales cuando el navegador solicita las fuentes de la interfaz.",
        ],
      },
      {
        title: "3. Google Analytics opcional",
        items: [
          "Google Analytics 4 no se carga ni recibe solicitudes de analítica hasta que lo permites expresamente. Rechazar la analítica no limita el servicio.",
          "Después del consentimiento enviamos vistas de página normalizadas y los eventos de producto room_create, room_join_start, room_join, room_join_failed, spin_start, share_room, share_room_failed, preset_select, template_select, template_save, elimination_enable y round_reset. Los eventos de acceso pueden incluir los parámetros de categorías fijas entry_type, has_password y reason; los eventos de compartir pueden incluir role y method. Estos parámetros no contienen contenido proporcionado por el usuario. Las URL de las salas se sustituyen por /r/:room; no se envían cadenas de consulta, códigos, nombres, contraseñas ni contenido de la ruleta.",
          "Google puede tratar información del dispositivo y navegador, ubicación aproximada derivada de la conexión, la dirección IP durante la transmisión, el referente, marcas de tiempo e identificadores analíticos propios almacenados en cookies _ga.",
          "El almacenamiento publicitario, los datos de usuario para anuncios, la personalización de anuncios, Google Signals, User-ID y la publicidad personalizada están desactivados en nuestra configuración.",
        ],
      },
      {
        title: "4. Finalidades y bases jurídicas",
        items: [
          "Proporcionar, sincronizar y administrar las salas solicitadas: ejecución de un contrato o medidas precontractuales (artículo 6.1.b del RGPD).",
          "Evitar abusos, mantener la fiabilidad del servicio y presentar una interfaz coherente, incluidas las fuentes: nuestros intereses legítimos (artículo 6.1.f), ponderados frente a los derechos de los usuarios.",
          "Medir visitas agregadas y el uso de funciones para mejorar GatherWheel: tu consentimiento (artículo 6.1.a y, cuando corresponda, normativa de privacidad electrónica). Puedes retirarlo en cualquier momento.",
        ],
      },
      {
        title: "5. Destinatarios y transferencias internacionales",
        items: [
          "Las personas de una misma sala ven los nombres visibles, el contenido de la sala y los resultados compartidos. Las sugerencias aparecen sin el nombre del autor, pero el registro del servidor permanece vinculado a su participante.",
          "Railway trata datos de la aplicación, de la base de datos y operativos como proveedor de alojamiento según la configuración de la cuenta de producción.",
          "Google recibe solicitudes de fuentes y, solo después del consentimiento para analítica, datos de GA4 como proveedor de analítica. La entidad contratante de Google y sus subencargados pueden tratar datos fuera del EEE.",
          "Cuando los datos salen del EEE, las garantías pueden incluir decisiones de adecuación, el Marco de Privacidad de Datos UE-EE. UU. cuando sea aplicable y las cláusulas contractuales tipo de la Comisión Europea. Puedes solicitarnos información sobre las garantías pertinentes.",
        ],
        links: esGoogleLinks,
      },
      {
        title: "6. Conservación",
        items: [
          "Las salas y sus registros de base de datos caducan después de siete días sin actividad y una tarea horaria los elimina; el anfitrión puede eliminar una sala antes. Las cookies de sesión de sala caducan después de siete días.",
          "Los registros de accesos fallidos solo permanecen en la memoria del servidor. Los registros y las copias de seguridad del alojamiento siguen los periodos configurados por el proveedor de producción.",
          "Los accesos a salas, el idioma y las plantillas permanecen en el dispositivo hasta que se eliminan. El registro de consentimiento caduca después de 180 días y entonces volvemos a solicitarlo.",
          "Las cookies de analítica están configuradas para un máximo de 180 días y su vencimiento no se prolonga en visitas posteriores. Al retirar el consentimiento, se solicita al navegador que elimine las cookies _ga de GatherWheel.",
          "Los datos de usuario y evento de GA4 están previstos para conservarse durante dos meses. Google puede conservar durante más tiempo informes agregados o datos necesarios por motivos legales o de seguridad conforme a sus términos.",
        ],
      },
      {
        title: "7. Tus opciones y derechos",
        paragraphs: [
          "Usa «Configuración de cookies» en cualquier página para rechazar, permitir o retirar el consentimiento para analítica con la misma facilidad con la que lo otorgaste. La retirada no afecta al tratamiento anterior.",
          "Según el RGPD, puedes solicitar acceso, rectificación, supresión, limitación o portabilidad; oponerte al tratamiento por interés legítimo y retirar el consentimiento. Contáctanos mediante los datos anteriores. También puedes reclamar ante la autoridad de control del lugar donde vives o trabajas, o donde creas que se produjo una infracción.",
          "En los ajustes de la sala, el participante actual puede descargar o eliminar los datos vinculados a su identidad; el anfitrión puede eliminar la sala. Para solicitudes sobre analítica, contáctanos, ya que la exportación de la aplicación no contiene datos de Google Analytics.",
        ],
      },
      {
        title: "8. Datos obligatorios, seguridad y decisiones automatizadas",
        paragraphs: [
          "Para prestar la función elegida son necesarios un nombre visible y el contenido de la sala correspondiente; la contraseña, los accesos guardados, las plantillas y el consentimiento para analítica son opcionales. Utilizamos tokens de acceso, hashes, límites de frecuencia, cookies restringidas y almacenamiento temporal, pero ningún servicio en línea está exento de riesgos.",
          "GatherWheel no toma decisiones que produzcan efectos jurídicos o de importancia similar. El resultado aleatorio solo se genera cuando un participante autorizado inicia el giro. No vendemos datos personales ni los utilizamos para publicidad o elaboración de perfiles.",
        ],
      },
      {
        title: "9. Cambios",
        paragraphs: [
          "Actualizaremos este aviso y su fecha de entrada en vigor cuando cambie sustancialmente el tratamiento y solicitaremos un nuevo consentimiento cuando sea necesario.",
        ],
      },
    ],
  },
  cookies: {
    eyebrow: "INFORMACIÓN LEGAL",
    title: "Política de cookies",
    summary:
      "Esta política enumera las cookies y el almacenamiento del navegador de GatherWheel, incluido Google Analytics opcional.",
    effectiveDateLabel: "Fecha de entrada en vigor",
    controllerTitle: "1. Responsable de este almacenamiento",
    contactLabel: "Contacto de privacidad",
    controllerFallback:
      "Antes del lanzamiento, el operador de producción debe publicar aquí su nombre legal y un contacto de privacidad.",
    sections: [
      {
        title: "2. Cookies necesarias y almacenamiento local",
        items: [
          "gatherwheel_session_<room-code>: token seguro HttpOnly de acceso a la sala; estrictamente necesario; caduca después de siete días.",
          "gatherwheel-locale: preferencia de idioma en localStorage; permanece hasta que se cambia o elimina.",
          "gatherwheel-rooms y el antiguo gatherwheel-host-rooms: accesos directos a salas guardados a petición del usuario en localStorage; hasta que se eliminan o caduca la sala.",
          "gatherwheel-templates: plantillas de ruleta guardadas en este dispositivo mediante localStorage; hasta que se eliminan.",
          "gatherwheel-consent-v1: elección de analítica, hora de la decisión y vencimiento; localStorage estrictamente necesario; 180 días.",
        ],
      },
      {
        title: "3. Cookies de analítica opcionales",
        items: [
          "_ga: distingue un navegador para GA4; cookie propia; como máximo 180 días.",
          "_ga_<container-id>: mantiene el estado de sesión de GA4; cookie propia; como máximo 180 días.",
          "El vencimiento está configurado para no renovarse en visitas posteriores. Google Analytics no se carga y estas cookies no se establecen antes del consentimiento.",
        ],
      },
      {
        title: "4. Consentimiento y eliminación",
        paragraphs: [
          "El primer aviso ofrece de forma equivalente las acciones Permitir y Rechazar. «Administrar preferencias» incluye un interruptor independiente para la analítica. La elección no bloquea el acceso.",
          "Usa el botón permanente «Configuración de cookies» para cambiar o retirar el consentimiento. Al retirarlo se desactiva la analítica y GatherWheel intenta eliminar sus cookies _ga. Los controles del navegador también pueden eliminar cookies y localStorage, pero borrar el almacenamiento necesario puede cerrar las sesiones o eliminar las preferencias guardadas.",
        ],
      },
      {
        title: "5. Solicitudes a terceros",
        paragraphs: [
          "Las solicitudes de Google Analytics solo se realizan después del consentimiento. Actualmente, las solicitudes de Google Fonts son necesarias para las fuentes de la interfaz y pueden revelar a Google la dirección IP y los metadatos de la solicitud aunque se rechace la analítica; no forman parte del consentimiento de GA.",
        ],
        links: esGoogleLinks,
      },
    ],
  },
};

const pt: LegalPair = {
  privacy: {
    eyebrow: "INFORMAÇÕES LEGAIS",
    title: "Política de Privacidade",
    summary:
      "Esta política explica como o GatherWheel trata dados pessoais, incluindo dados opcionais do Google Analytics.",
    effectiveDateLabel: "Data de vigência",
    controllerTitle: "1. Controlador e contato",
    contactLabel: "Contato de privacidade",
    controllerFallback:
      "O operador do serviço é o controlador. Antes do lançamento, o operador de produção deve publicar aqui seu nome legal e um contato de privacidade.",
    sections: [
      {
        title: "2. Dados que tratamos",
        items: [
          "Dados da sala fornecidos por você: nome de exibição, título da sala, opções da roleta, sugestões, senha opcional, permissões, datas e horários e resultados compartilhados. As senhas são armazenadas somente como hashes Argon2 unidirecionais.",
          "Dados de sessão e segurança: um token aleatório de sessão da sala (somente o hash é armazenado no banco de dados), registros temporários de IP na memória usados para limitar tentativas de entrada malsucedidas e logs HTTP operacionais que o provedor de hospedagem pode criar.",
          "Dados no dispositivo: idioma, atalhos de salas salvas, modelos de roleta e registro do seu consentimento para análise.",
          "O Google Fonts recebe o endereço IP e metadados HTTP comuns quando o navegador solicita as fontes da interface.",
        ],
      },
      {
        title: "3. Google Analytics opcional",
        items: [
          "O Google Analytics 4 não é carregado nem recebe solicitações de análise até que você permita expressamente. Recusar a análise não restringe o serviço.",
          "Após o consentimento, enviamos visualizações de página normalizadas e os eventos de produto room_create, room_join_start, room_join, room_join_failed, spin_start, share_room, share_room_failed, preset_select, template_select, template_save, elimination_enable e round_reset. Eventos de entrada podem incluir os parâmetros de categorias fixas entry_type, has_password e reason; eventos de compartilhamento podem incluir role e method. Esses parâmetros não contêm conteúdo fornecido pelo usuário. URLs de salas são substituídas por /r/:room; parâmetros de consulta, códigos, nomes, senhas e conteúdo da roleta não são enviados.",
          "O Google pode tratar informações do dispositivo e navegador, localização aproximada derivada da conexão, endereço IP durante a transmissão, referenciador, datas e horários e identificadores analíticos próprios armazenados em cookies _ga.",
          "Armazenamento de publicidade, dados de usuário para anúncios, personalização de anúncios, Google Signals, User-ID e publicidade personalizada estão desativados na configuração da nossa tag.",
        ],
      },
      {
        title: "4. Finalidades e bases legais",
        items: [
          "Fornecer, sincronizar e administrar as salas solicitadas por você — execução de contrato ou medidas pré-contratuais (artigo 6(1)(b) do GDPR).",
          "Prevenir abusos, manter o serviço confiável e apresentar uma interface consistente, incluindo as fontes — nossos interesses legítimos (artigo 6(1)(f)), ponderados em relação aos direitos dos usuários.",
          "Medir visitas agregadas e o uso de recursos para melhorar o GatherWheel — seu consentimento (artigo 6(1)(a) e, quando aplicável, regras de privacidade eletrônica). Você pode retirá-lo a qualquer momento.",
        ],
      },
      {
        title: "5. Destinatários e transferências internacionais",
        items: [
          "As pessoas na mesma sala veem nomes de exibição, conteúdo da sala e resultados compartilhados. As sugestões aparecem sem o nome do autor, mas o registro no servidor permanece vinculado ao participante.",
          "A Railway trata dados da aplicação, do banco de dados e operacionais como provedora de hospedagem, conforme a configuração da conta de produção.",
          "O Google recebe solicitações de fontes e, somente após o consentimento para análise, dados do GA4 como nosso provedor de análise. A entidade contratante do Google e seus suboperadores podem tratar dados fora do EEE.",
          "Quando os dados saem do EEE, as garantias podem incluir decisões de adequação, o Quadro de Privacidade de Dados UE–EUA quando aplicável e as cláusulas contratuais-padrão da Comissão Europeia. Você pode nos solicitar informações sobre as garantias relevantes.",
        ],
        links: ptGoogleLinks,
      },
      {
        title: "6. Retenção",
        items: [
          "Salas e registros relacionados no banco de dados expiram após sete dias sem atividade e são removidos por uma limpeza executada a cada hora; o anfitrião pode excluir a sala antes. Cookies de sessão da sala expiram após sete dias.",
          "Registros de entradas malsucedidas permanecem somente na memória do servidor. Logs e backups de hospedagem seguem os prazos de retenção configurados pelo provedor de produção.",
          "Atalhos de salas, idioma e modelos permanecem no dispositivo até serem removidos. O registro de consentimento expira após 180 dias; depois disso, solicitamos a escolha novamente.",
          "Cookies de análise são configurados para no máximo 180 dias e sua validade não é prorrogada em visitas posteriores. A retirada do consentimento solicita ao navegador que exclua os cookies _ga do GatherWheel.",
          "Os dados do GA4 no nível de usuário e evento devem ser retidos por dois meses. O Google pode reter por mais tempo relatórios agregados ou dados necessários por motivos legais ou de segurança, conforme seus termos.",
        ],
      },
      {
        title: "7. Suas escolhas e direitos",
        paragraphs: [
          "Use “Configurações de cookies” em qualquer página para recusar, permitir ou retirar o consentimento para análise com a mesma facilidade com que o concedeu. A retirada não afeta o tratamento realizado anteriormente.",
          "Dependendo do GDPR, você pode solicitar acesso, correção, exclusão, limitação ou portabilidade; opor-se ao tratamento baseado em interesse legítimo e retirar o consentimento. Entre em contato conosco pelos dados acima. Você também pode reclamar à autoridade supervisora do local onde vive, trabalha ou acredita que ocorreu uma infração.",
          "Nas configurações da sala, o participante atual pode baixar ou excluir dados vinculados àquela identidade; o anfitrião pode excluir a sala. Para solicitações relativas à análise, entre em contato conosco, pois a exportação do aplicativo não contém dados do Google Analytics.",
        ],
      },
      {
        title: "8. Dados obrigatórios, segurança e decisões automatizadas",
        paragraphs: [
          "Um nome de exibição e o conteúdo da sala necessário ao recurso escolhido são obrigatórios para fornecê-lo; senha, atalho salvo, modelo e consentimento para análise são opcionais. Usamos tokens de acesso, hashes, limites de frequência, cookies restritos e armazenamento temporário, mas nenhum serviço online é isento de riscos.",
          "O GatherWheel não toma decisões que produzam efeitos jurídicos ou de importância semelhante. O resultado aleatório ocorre somente quando um participante autorizado inicia o giro. Não vendemos dados pessoais nem os utilizamos para publicidade ou criação de perfis.",
        ],
      },
      {
        title: "9. Alterações",
        paragraphs: [
          "Atualizaremos este aviso e sua data de vigência quando o tratamento mudar de forma relevante e solicitaremos novo consentimento quando necessário.",
        ],
      },
    ],
  },
  cookies: {
    eyebrow: "INFORMAÇÕES LEGAIS",
    title: "Política de Cookies",
    summary:
      "Esta política relaciona os cookies e o armazenamento do navegador usados pelo GatherWheel, incluindo o Google Analytics opcional.",
    effectiveDateLabel: "Data de vigência",
    controllerTitle: "1. Responsável por este armazenamento",
    contactLabel: "Contato de privacidade",
    controllerFallback:
      "Antes do lançamento, o operador de produção deve publicar aqui seu nome legal e um contato de privacidade.",
    sections: [
      {
        title: "2. Cookies necessários e armazenamento local",
        items: [
          "gatherwheel_session_<room-code> — token seguro HttpOnly de acesso à sala; estritamente necessário; expira após sete dias.",
          "gatherwheel-locale — preferência de idioma no localStorage; permanece até ser alterada ou removida.",
          "gatherwheel-rooms e o antigo gatherwheel-host-rooms — atalhos de salas salvos a seu pedido no localStorage; até serem removidos ou a sala expirar.",
          "gatherwheel-templates — modelos de roleta salvos neste dispositivo no localStorage; até serem removidos.",
          "gatherwheel-consent-v1 — escolha de análise, horário da decisão e validade; localStorage estritamente necessário; 180 dias.",
        ],
      },
      {
        title: "3. Cookies opcionais de análise",
        items: [
          "_ga — diferencia um navegador para o GA4; cookie próprio; no máximo 180 dias.",
          "_ga_<container-id> — mantém o estado da sessão do GA4; cookie próprio; no máximo 180 dias.",
          "A validade é configurada para não ser renovada em visitas posteriores. O Google Analytics não é carregado e esses cookies não são definidos antes do consentimento.",
        ],
      },
      {
        title: "4. Consentimento e exclusão",
        paragraphs: [
          "O primeiro aviso oferece as opções Permitir e Recusar com igual destaque. “Gerenciar preferências” apresenta um controle separado para análise. Sua escolha não bloqueia o acesso.",
          "Use o botão permanente “Configurações de cookies” para alterar ou retirar o consentimento. Após a retirada, a análise é desativada e o GatherWheel tenta excluir seus cookies _ga. Os controles do navegador também podem excluir cookies e o localStorage, mas remover o armazenamento necessário pode desconectar você das salas ou apagar preferências salvas.",
        ],
      },
      {
        title: "5. Solicitações a terceiros",
        paragraphs: [
          "Solicitações do Google Analytics ocorrem somente após o consentimento. As solicitações do Google Fonts são atualmente necessárias para as fontes da interface e podem expor ao Google seu endereço IP e metadados da solicitação mesmo que a análise seja recusada; elas não fazem parte do consentimento do GA.",
        ],
        links: ptGoogleLinks,
      },
    ],
  },
};

const jaGoogleLinks = [
  {
    label: "パートナーサイトから収集した情報のGoogleによる使用",
    href: "https://policies.google.com/technologies/partner-sites",
  },
  {
    label: "Googleプライバシーポリシー",
    href: "https://policies.google.com/privacy",
  },
  {
    label: "Google広告データ処理規約",
    href: "https://business.safety.google/adsprocessorterms/",
  },
];

const ja: LegalPair = {
  privacy: {
    eyebrow: "法的情報",
    title: "プライバシーポリシー",
    summary:
      "このポリシーでは、任意のGoogle Analyticsデータを含め、GatherWheelが個人データをどのように取り扱うかを説明します。",
    effectiveDateLabel: "発効日",
    controllerTitle: "1. 管理者と連絡先",
    contactLabel: "プライバシーに関する連絡先",
    controllerFallback:
      "本サービスの運営者がデータ管理者です。本番環境の運営者は、サービス公開前に正式名称とプライバシーに関する連絡先をここに掲載する必要があります。",
    sections: [
      {
        title: "2. 取り扱うデータ",
        items: [
          "入力されたルームデータ：表示名、ルーム名、ルーレットの選択肢、提案、任意のパスワード、権限、日時情報、共有された抽選結果。パスワードは一方向のArgon2ハッシュとしてのみ保存されます。",
          "セッションおよびセキュリティデータ：ランダムなルームセッショントークン（データベースにはハッシュのみを保存）、参加失敗の回数制限に使用する一時的なメモリー内IP記録、およびホスティング事業者が作成する場合がある運用HTTPログ。",
          "端末上のデータ：言語、保存したルームのショートカット、ルーレットのテンプレート、アクセス解析への同意記録。",
          "ブラウザーが画面表示用フォントを要求すると、Google FontsはIPアドレスと通常のHTTPメタデータを受信します。",
        ],
      },
      {
        title: "3. 任意のGoogle Analytics",
        items: [
          "アクセス解析を明示的に許可するまで、Google Analytics 4は読み込まれず、解析リクエストも受信しません。拒否してもサービスの利用は制限されません。",
          "同意後、正規化したページビューと、room_create、room_join_start、room_join、room_join_failed、spin_start、share_room、share_room_failed、preset_select、template_select、template_save、elimination_enable、round_resetの各プロダクトイベントを送信します。参加イベントには固定カテゴリのentry_type、has_password、reasonが、共有イベントにはroleとmethodが含まれる場合があります。これらのパラメーターにユーザーが入力した内容は含まれません。ルームURLは/r/:roomに置き換えられ、クエリ文字列、ルームコード、名前、パスワード、ルーレットの内容は送信されません。",
          "Googleは、端末やブラウザーの情報、接続から推定したおおよその地域、通信中のIPアドレス、参照元情報、日時情報、および_ga Cookieに保存されるファーストパーティーの解析識別子を取り扱う場合があります。",
          "広告ストレージ、広告用ユーザーデータ、広告のパーソナライズ、Google Signals、User-ID、パーソナライズ広告はタグ設定で無効にしています。",
        ],
      },
      {
        title: "4. 利用目的と法的根拠",
        items: [
          "依頼されたルームの提供、同期、管理 — 契約の履行または契約前の手続き（GDPR第6条1項(b)）。",
          "不正利用の防止、サービスの信頼性維持、フォントを含む一貫した画面の提供 — ユーザーの権利と比較衡量した当社の正当な利益（第6条1項(f)）。",
          "GatherWheelを改善するための訪問数と機能利用の集計 — あなたの同意（第6条1項(a)および該当するePrivacy規則）。同意はいつでも撤回できます。",
        ],
      },
      {
        title: "5. データの受領者と国外移転",
        items: [
          "同じルームの参加者は、表示名、ルームの内容、共有された結果を見ることができます。提案には作成者名が表示されませんが、サーバー上の記録は該当する参加者に関連付けられたままです。",
          "Railwayは、本番アカウントの設定に基づき、ホスティング事業者としてアプリケーション、データベース、運用データを処理します。",
          "Googleはフォントのリクエストを受信し、アクセス解析への同意後に限り、解析事業者としてGA4データを受信します。Googleの該当する契約法人および再処理者は、EEA域外でデータを処理する場合があります。",
          "データがEEA域外に移転される場合、十分性認定、該当する場合のEU–USデータプライバシーフレームワーク、欧州委員会の標準契約条項などが保護措置となる場合があります。関連する保護措置の情報は当社に請求できます。",
        ],
        links: jaGoogleLinks,
      },
      {
        title: "6. 保存期間",
        items: [
          "ルームと関連するデータベース記録は、操作がない状態で7日経過すると期限切れとなり、1時間ごとのクリーンアップで削除されます。ホストはそれ以前にルームを削除できます。ルームセッションCookieの有効期間は7日です。",
          "参加失敗の記録はサーバーのメモリー内だけに残ります。ホスティングログとバックアップには、本番環境の事業者に設定された保存期間が適用されます。",
          "保存したルームのショートカット、言語、テンプレートは削除されるまで端末に残ります。同意記録は180日後に期限切れとなり、再度選択を求めます。",
          "解析Cookieの有効期間は最長180日に設定され、再訪問時に延長されません。同意を撤回すると、GatherWheelの_ga Cookieを削除するようブラウザーに要求します。",
          "GA4のユーザー単位およびイベント単位のデータは2か月間保存する想定です。Googleは、集計済みレポートや安全上・法的な理由で必要なデータを、規約に基づきさらに長期間保存する場合があります。",
        ],
      },
      {
        title: "7. 選択肢と権利",
        paragraphs: [
          "各ページの「Cookie設定」から、同意したときと同じように簡単にアクセス解析を拒否、許可、または同意を撤回できます。撤回前に行われた処理には影響しません。",
          "GDPRの適用に応じて、アクセス、訂正、消去、制限、データポータビリティーの請求、正当な利益に基づく処理への異議申立て、同意の撤回ができます。上記の連絡先までお問い合わせください。居住地、勤務先、または侵害が発生したと思われる場所の監督機関に苦情を申し立てることもできます。",
          "ルーム設定では、現在の参加者がそのルームIDに関連するデータをダウンロードまたは削除でき、ホストはルームを削除できます。アプリのエクスポートにはGoogle Analyticsデータが含まれないため、解析に関する請求は当社へお問い合わせください。",
        ],
      },
      {
        title: "8. 必須データ、セキュリティー、自動化された意思決定",
        paragraphs: [
          "選択した機能を提供するには、表示名とその機能に必要なルーム内容が必須です。パスワード、保存したショートカット、テンプレート、解析への同意は任意です。アクセストークン、ハッシュ化、回数制限、制限付きCookie、期限付き保存を使用していますが、オンラインサービスにリスクがまったくないわけではありません。",
          "GatherWheelは、法的または同等に重大な効果を生じさせる意思決定を行いません。ランダムな結果は、権限を持つ参加者が抽選を開始した場合にのみ生成されます。個人データを販売せず、広告やプロファイリングにも使用しません。",
        ],
      },
      {
        title: "9. 変更",
        paragraphs: [
          "データ処理に重大な変更があった場合は、この通知と発効日を更新し、必要に応じて改めて同意を求めます。",
        ],
      },
    ],
  },
  cookies: {
    eyebrow: "法的情報",
    title: "Cookieポリシー",
    summary:
      "このポリシーでは、任意のGoogle Analyticsを含め、GatherWheelが使用するCookieとブラウザー保存領域を説明します。",
    effectiveDateLabel: "発効日",
    controllerTitle: "1. この保存領域の運営者",
    contactLabel: "プライバシーに関する連絡先",
    controllerFallback:
      "本番環境の運営者は、サービス公開前に正式名称とプライバシーに関する連絡先をここに掲載する必要があります。",
    sections: [
      {
        title: "2. 必須Cookieとローカルストレージ",
        items: [
          "gatherwheel_session_<room-code> — 安全なHttpOnlyルームアクセストークン。厳密に必要。有効期間は7日。",
          "gatherwheel-locale — 言語設定。localStorage。変更または消去されるまで保持。",
          "gatherwheel-roomsおよび旧gatherwheel-host-rooms — 要求により保存したルームのショートカット。localStorage。削除またはルームの期限切れまで保持。",
          "gatherwheel-templates — この端末に保存したルーレットのテンプレート。localStorage。削除されるまで保持。",
          "gatherwheel-consent-v1 — 解析の選択、決定日時、有効期限。厳密に必要なlocalStorage。180日。",
        ],
      },
      {
        title: "3. 任意の解析Cookie",
        items: [
          "_ga — GA4でブラウザーを識別。ファーストパーティーCookie。最長180日。",
          "_ga_<container-id> — GA4のセッション状態を保持。ファーストパーティーCookie。最長180日。",
          "再訪問時に有効期限が延長されないよう設定しています。同意前にGoogle Analyticsは読み込まれず、これらのCookieも設定されません。",
        ],
      },
      {
        title: "4. 同意と削除",
        paragraphs: [
          "最初のバナーでは「許可」と「拒否」を同等に選択できます。「設定を管理」にはアクセス解析用の独立したスイッチがあります。選択によってサービスへのアクセスが妨げられることはありません。",
          "常時表示される「Cookie設定」ボタンから同意を変更または撤回できます。撤回すると解析が無効になり、GatherWheelは_ga Cookieの削除を試みます。ブラウザーの設定からCookieとlocalStorageを削除することもできますが、必須の保存領域を削除するとルームからログアウトしたり、設定が消去されたりする場合があります。",
        ],
      },
      {
        title: "5. 第三者へのリクエスト",
        paragraphs: [
          "Google Analyticsへのリクエストは同意後にのみ発生します。Google Fontsへのリクエストは現在、画面表示用フォントに必要であり、解析を拒否した場合でもIPアドレスとリクエストメタデータがGoogleに送られる場合があります。これはGAへの同意には含まれません。",
        ],
        links: jaGoogleLinks,
      },
    ],
  },
};

const zhHantGoogleLinks = [
  {
    label: "Google 如何使用合作夥伴網站提供的資料",
    href: "https://policies.google.com/technologies/partner-sites",
  },
  {
    label: "Google 私隱政策",
    href: "https://policies.google.com/privacy",
  },
  {
    label: "Google Ads 資料處理條款",
    href: "https://business.safety.google/adsprocessorterms/",
  },
];

const zhHant: LegalPair = {
  privacy: {
    eyebrow: "法律資訊",
    title: "私隱政策",
    summary:
      "本政策說明 GatherWheel 如何處理個人資料，包括選用的 Google Analytics 資料。",
    effectiveDateLabel: "生效日期",
    controllerTitle: "1. 資料控制者及聯絡方式",
    contactLabel: "私隱事宜聯絡方式",
    controllerFallback:
      "服務營運者是資料控制者。正式推出服務前，正式環境營運者必須在此公布法定名稱和私隱事宜聯絡方式。",
    sections: [
      {
        title: "2. 我們處理的資料",
        items: [
          "你提供的房間資料：顯示名稱、房間名稱、轉盤選項、建議、選填密碼、權限、時間戳記和共享轉動結果。密碼只會以單向 Argon2 雜湊值儲存。",
          "工作階段及保安資料：隨機房間工作階段權杖（資料庫只會儲存其雜湊值）、為限制加入失敗次數而暫存於記憶體的 IP 記錄，以及託管服務供應商可能建立的操作 HTTP 記錄。",
          "裝置上的資料：語言、已儲存的房間捷徑、轉盤範本和你的分析同意記錄。",
          "當瀏覽器要求載入介面字型時，Google Fonts 會接收 IP 位址和一般 HTTP 中繼資料。",
        ],
      },
      {
        title: "3. 選用的 Google Analytics",
        items: [
          "在你主動允許分析前，Google Analytics 4 不會載入，也不會收到任何分析要求。拒絕分析不會限制服務功能。",
          "取得同意後，我們會傳送標準化的頁面瀏覽，以及 room_create、room_join_start、room_join、room_join_failed、spin_start、share_room、share_room_failed、preset_select、template_select、template_save、elimination_enable 和 round_reset 產品事件。加入事件可能包含採用固定分類值的 entry_type、has_password 和 reason 參數；分享事件可能包含 role 和 method。這些參數不含使用者提供的內容。房間網址會替換為 /r/:room；查詢字串、房間代碼、名稱、密碼和轉盤內容均不會傳送。",
          "Google 可能處理裝置和瀏覽器資料、根據連線推算的大概位置、傳輸期間的 IP 位址、來源頁面資料、時間戳記，以及儲存在 _ga Cookie 中的第一方分析識別碼。",
          "我們的標籤設定已停用廣告儲存、廣告使用者資料、廣告個人化、Google Signals、User-ID 和個人化廣告。",
        ],
      },
      {
        title: "4. 目的及法律依據",
        items: [
          "提供、同步和管理你要求使用的房間——履行合約或訂立合約前的措施（GDPR 第 6(1)(b) 條）。",
          "防止濫用、維持服務可靠性，以及提供包括字型在內的一致介面——我們經權衡使用者權利後的合法利益（第 6(1)(f) 條）。",
          "量度整體瀏覽量和功能使用情況以改善 GatherWheel——你的同意（第 6(1)(a) 條及適用的電子私隱規則）。你可以隨時撤回同意。",
        ],
      },
      {
        title: "5. 資料接收者及跨境轉移",
        items: [
          "同一房間內的人可以看到顯示名稱、房間內容和共享結果。建議不會顯示作者名稱，但後端記錄仍會連結至相應參與者。",
          "Railway 按照正式環境帳戶設定，以託管服務供應商身分處理應用程式、資料庫和操作資料。",
          "Google 會收到字型要求；只有在你同意分析後，才會以我們的分析服務供應商身分收到 GA4 資料。適用的 Google 合約實體及其次處理者可能在歐洲經濟區以外處理資料。",
          "資料離開歐洲經濟區時，保障措施可能包括充分性決定、適用時的歐盟–美國資料私隱框架，以及歐洲委員會的標準合約條款。你可以向我們索取相關保障措施的資料。",
        ],
        links: zhHantGoogleLinks,
      },
      {
        title: "6. 保留期限",
        items: [
          "房間和相關資料庫記錄在七天沒有活動後到期，並由每小時執行的清理工作移除；主持人也可提早刪除房間。房間工作階段 Cookie 在七天後到期。",
          "加入失敗記錄只會保留在伺服器記憶體中。託管記錄和備份會按照正式環境供應商設定的保留期限保存。",
          "已儲存的房間捷徑、語言和範本會保留在裝置上，直到被移除。同意記錄在 180 天後到期，屆時我們會再次詢問。",
          "分析 Cookie 的有效期設定為不超過 180 天，日後再次瀏覽也不會延長。撤回同意時，系統會要求瀏覽器刪除 GatherWheel 的 _ga Cookie。",
          "GA4 使用者層級和事件層級資料預定保留兩個月。Google 可能按其條款，更長時間保留匯總報告或因保安及法律理由而必須保存的資料。",
        ],
      },
      {
        title: "7. 你的選擇和權利",
        paragraphs: [
          "使用任何頁面的「Cookie 設定」，即可像給予同意時一樣輕鬆地拒絕、允許或撤回分析同意。撤回不會影響在此之前已進行的處理。",
          "視乎 GDPR 是否適用，你可以要求存取、更正、刪除、限制或轉移資料；反對基於合法利益的處理；以及撤回同意。請透過上述方式聯絡我們。你亦可向居住地、工作地或你認為發生違規行為所在地的監管機構投訴。",
          "目前參與者可在房間設定中下載或刪除與其房間身分相關的資料；主持人可以刪除整個房間。如要提出分析資料要求，請聯絡我們，因為應用程式匯出檔案不包含 Google Analytics 資料。",
        ],
      },
      {
        title: "8. 必要資料、保安及自動化決策",
        paragraphs: [
          "提供所選功能時，顯示名稱和該功能所需的房間內容屬必要資料；密碼、已儲存捷徑、範本和分析同意則屬選用。我們使用存取權杖、雜湊、速率限制、受限制 Cookie 和有時限的儲存空間，但任何網上服務均不能完全消除風險。",
          "GatherWheel 不會作出產生法律或類似重大影響的決策。只有獲授權的參與者啟動轉動時，才會產生隨機結果。我們不會出售個人資料，也不會將其用於廣告或建立個人檔案。",
        ],
      },
      {
        title: "9. 變更",
        paragraphs: [
          "如資料處理方式有重大變更，我們會更新本通知和生效日期，並在需要時重新徵求同意。",
        ],
      },
    ],
  },
  cookies: {
    eyebrow: "法律資訊",
    title: "Cookie 政策",
    summary:
      "本政策列出 GatherWheel 使用的 Cookie 和瀏覽器儲存空間，包括選用的 Google Analytics。",
    effectiveDateLabel: "生效日期",
    controllerTitle: "1. 此儲存空間的營運者",
    contactLabel: "私隱事宜聯絡方式",
    controllerFallback:
      "正式推出服務前，正式環境營運者必須在此公布法定名稱和私隱事宜聯絡方式。",
    sections: [
      {
        title: "2. 必要 Cookie 和本機儲存空間",
        items: [
          "gatherwheel_session_<room-code>——安全的 HttpOnly 房間存取權杖；絕對必要；七天後到期。",
          "gatherwheel-locale——語言偏好；localStorage；保留至變更或清除。",
          "gatherwheel-rooms 和舊版 gatherwheel-host-rooms——按你的要求儲存的房間捷徑；localStorage；保留至移除或房間到期。",
          "gatherwheel-templates——儲存在此裝置上的轉盤範本；localStorage；保留至移除。",
          "gatherwheel-consent-v1——分析選擇、決定時間和到期時間；絕對必要的 localStorage；180 天。",
        ],
      },
      {
        title: "3. 選用的分析 Cookie",
        items: [
          "_ga——供 GA4 識別瀏覽器；第一方 Cookie；不超過 180 天。",
          "_ga_<container-id>——維持 GA4 工作階段狀態；第一方 Cookie；不超過 180 天。",
          "有效期設定為不會在再次瀏覽時延長。同意前不會載入 Google Analytics，也不會設定這些 Cookie。",
        ],
      },
      {
        title: "4. 同意及刪除",
        paragraphs: [
          "首次顯示的橫幅同等提供「允許」和「拒絕」選項。「管理偏好」提供獨立的分析開關。你的選擇不會阻止存取服務。",
          "使用常駐的「Cookie 設定」按鈕可變更或撤回同意。撤回後，分析功能會停用，而 GatherWheel 會嘗試刪除其 _ga Cookie。瀏覽器控制項也可以刪除 Cookie 和 localStorage，但移除必要儲存空間可能會令你登出房間或清除已儲存的偏好。",
        ],
      },
      {
        title: "5. 第三方要求",
        paragraphs: [
          "只有在同意後才會傳送 Google Analytics 要求。目前介面字型需要使用 Google Fonts，因此即使你拒絕分析，Google 仍可能收到你的 IP 位址和要求中繼資料；這些要求不屬於 GA 同意的一部分。",
        ],
        links: zhHantGoogleLinks,
      },
    ],
  },
};

export const additionalLegalDocuments = { es, pt, ja, "zh-Hant": zhHant };
