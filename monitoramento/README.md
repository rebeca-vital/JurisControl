# Monitoramento do JurisControl

## 1. Objetivo

Esta etapa do projeto JurisControl tem como objetivo implementar o monitoramento da infraestrutura de banco de dados MySQL, permitindo acompanhar seu funcionamento e visualizar métricas importantes por meio de dashboards.

A implementação foi realizada sem modificar os arquivos originais da aplicação ou a estrutura do banco de dados.

## 2. Tecnologias utilizadas

- **MySQL 8.0:** banco de dados da aplicação.
- **Prometheus 3.13.5:** coleta e armazenamento de métricas.
- **MySQL Exporter 0.21.0:** disponibiliza métricas do MySQL para o Prometheus.
- **Grafana:** visualização das métricas em dashboards.

## 3. Arquitetura do monitoramento

O funcionamento segue o fluxo:

MySQL → MySQL Exporter → Prometheus → Grafana

O MySQL Exporter coleta informações do banco de dados, o Prometheus armazena essas métricas e o Grafana apresenta os resultados visualmente.

## 4. Configurações utilizadas

- MySQL: `127.0.0.1:3306`
- MySQL Exporter: `127.0.0.1:9104`
- Prometheus: `127.0.0.1:9090`
- Grafana: `localhost:3000`

O Prometheus utiliza intervalo de coleta de 15 segundos.

## 5. Configuração do MySQL Exporter

Foi criado um usuário específico chamado `exporter`, com permissões necessárias para consultar métricas do MySQL.

O arquivo de configuração utiliza o formato:

```ini
[client]
user=exporter
password=SUA_SENHA_LOCAL
```

O arquivo de exemplo disponibilizado é `exporter.my.cnf.example`.

Para utilizar, deve-se criar o arquivo `exporter.my.cnf` na pasta do Exporter e inserir a senha configurada localmente.

**Importante:** o arquivo com a senha real não deve ser enviado ao GitHub.

## 6. Configuração do Prometheus

O arquivo `prometheus.yml` define dois alvos de coleta:

- Prometheus: `127.0.0.1:9090`
- MySQL Exporter: `127.0.0.1:9104`

O intervalo de coleta configurado é de 15 segundos.

## 7. Inicialização dos serviços

No Windows, os componentes devem ser iniciados nesta ordem:

### 7.1 MySQL

Verificar se o serviço MySQL80 está em execução nos serviços do Windows.

### 7.2 MySQL Exporter

Executar no terminal, a partir da pasta do Exporter:

```powershell
.\mysqld_exporter-0.21.0.windows-amd64\mysqld_exporter.exe --config.my-cnf="CAMINHO_COMPLETO\exporter.my.cnf" --mysqld.address=127.0.0.1:3306 --web.listen-address=127.0.0.1:9104
```

### 7.3 Prometheus

Executar na pasta onde o Prometheus foi extraído:

```powershell
.\prometheus.exe --config.file=prometheus.yml --web.listen-address=127.0.0.1:9090
```

### 7.4 Grafana

Verificar se o serviço Grafana está em execução e acessar:

http://localhost:3000

O Grafana utiliza o Prometheus como fonte de dados, configurado pelo endereço:

`http://127.0.0.1:9090`

## 8. Dashboard desenvolvido

Foi criado o dashboard **JurisControl - Monitoramento MySQL**, contendo sete painéis:

1. **Status do MySQL:** verifica se o banco está acessível.
2. **Conexões Ativas MySQL:** acompanha as conexões abertas.
3. **Consultas por segundo (MySQL):** acompanha a atividade de consultas.
4. **Tempo de Atividade MySQL:** apresenta o tempo de funcionamento do servidor.
5. **Uso de Conexões MySQL:** mostra a utilização das conexões disponíveis.
6. **Consultas Lentas MySQL:** acompanha a quantidade acumulada de consultas lentas.
7. **Threads em Execução MySQL:** monitora as threads em execução.

O dashboard utiliza atualização automática a cada 30 segundos.

## 9. Considerações finais

A implementação permite acompanhar o funcionamento do banco de dados do JurisControl por meio de métricas coletadas em tempo real.

A solução foi desenvolvida em uma pasta independente (`monitoramento/`), preservando os arquivos originais da aplicação e as alterações realizadas pelos demais integrantes da equipe.

As credenciais e os executáveis utilizados localmente não devem ser compartilhados no repositório.