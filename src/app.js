const express = require("express");
const promClient = require("prom-client");
const axios = require("axios");
const dayjs = require("dayjs");
const { exec } = require("child_process");

const app = express();
const port = 3457;

const nodeTypeGauge = new promClient.Gauge({
    name: "celestia_node_node_type",
    help: "node_type",
    labelNames: ["node_id"],
});

const latestMetricsTimeGauge = new promClient.Gauge({
    name: "celestia_node_latest_metrics_time",
    help: "latest_metrics_time",
    labelNames: ["node_id"],
});

const upTimeGauge = new promClient.Gauge({
    name: "celestia_node_uptime",
    help: "uptime",
    labelNames: ["node_id"],
});

const lastPfbTimestampGauge = new promClient.Gauge({
    name: "celestia_node_last_pfb_timestamp",
    help: "last_pfb_timestamp",
    labelNames: ["node_id"],
});

const pfbCountGauge = new promClient.Gauge({
    name: "celestia_node_pfb_count",
    help: "pfb_count",
    labelNames: ["node_id"],
});

const headGauge = new promClient.Gauge({
    name: "celestia_node_head",
    help: "head",
    labelNames: ["node_id"],
});

const networkHeightGauge = new promClient.Gauge({
    name: "celestia_node_network_height",
    help: "network_height",
    labelNames: ["node_id"],
});

const dasLatestSampledTimestampGauge = new promClient.Gauge({
    name: "celestia_node_das_latest_sampled_timestamp",
    help: "das_latest_sampled_timestamp",
    labelNames: ["node_id"],
});

const dasNetworkHeadGauge = new promClient.Gauge({
    name: "celestia_node_das_network_head",
    help: "das_network_head",
    labelNames: ["node_id"],
});

const dasSampleChainHeadGauge = new promClient.Gauge({
    name: "celestia_node_das_sampled_chain_head",
    help: "das_sampled_chain_head",
    labelNames: ["node_id"],
});

const dasSampleHeadersCounterGauge = new promClient.Gauge({
    name: "celestia_node_das_sampled_headers_counter",
    help: "das_sampled_headers_counter",
    labelNames: ["node_id"],
});

const dasTotalSampledHeadersGauge = new promClient.Gauge({
    name: "celestia_node_das_total_sampled_headers",
    help: "das_total_sampled_headers",
    labelNames: ["node_id"],
});

const totalSyncedHeadersGauge = new promClient.Gauge({
    name: "celestia_node_total_synced_headers",
    help: "total_synced_headers",
    labelNames: ["node_id"],
});

const startTimeGauge = new promClient.Gauge({
    name: "celestia_node_start_time",
    help: "start_time",
    labelNames: ["node_id"],
});

const lastRestartTimeGauge = new promClient.Gauge({
    name: "celestia_node_last_restart_time",
    help: "last_restart_time",
    labelNames: ["node_id"],
});

const nodeRuntimeCounterInSecondsGauge = new promClient.Gauge({
    name: "celestia_node_node_runtime_counter_in_seconds",
    help: "node_runtime_counter_in_seconds",
    labelNames: ["node_id"],
});

const lastAccumulativeNodeRuntimeCounterInSecondsGauge = new promClient.Gauge({
    name: "celestia_node_last_accumulative_node_runtime_counter_in_seconds",
    help: "last_accumulative_node_runtime_counter_in_seconds",
    labelNames: ["node_id"],
});

// const topUptimeGauge = new promClient.Gauge({
//     name: "celestia_node_top_uptime",
//     help: "celestia_node_top_uptime",
// });

// const topPfbCountGauge = new promClient.Gauge({
//     name: "celestia_node_top_pfb",
//     help: "celestia_node_top_pfb",
// });

const bandwithRateInGauge = new promClient.Gauge({
    name: "celestia_node_bandwith_rate_in",
    help: "celestia_node_bandwith_rate_in  in bytes/s",
});

const bandwithRateOutGauge = new promClient.Gauge({
    name: "celestia_node_bandwith_rate_out",
    help: "celestia_node_bandwith_rate_out  in bytes/s",
});

const bandwithTotalInGauge = new promClient.Gauge({
    name: "celestia_node_bandwith_total_in",
    help: "celestia_node_bandwith_total_in  in bytes",
});

const bandwithTotalOutGauge = new promClient.Gauge({
    name: "celestia_node_bandwith_total_out",
    help: "celestia_node_bandwith_total_out in bytes",
});

const localNodeTypeGauge = new promClient.Gauge({
    name: "celestia_node_local_node_type",
    help: "celestia_node_local_node_type",
});

const localNodeApiVersionGauge = new promClient.Gauge({
    name: "celestia_node_local_node_api_version",
    help: "celestia_node_local_node_api_version",
});

const localNodeWalletAddressGauge = new promClient.Gauge({
    name: "celestia_node_local_node_wallet_address",
    help: "celestia_node_local_node_wallet_address",
});

const localNodeWalletBalanceGauge = new promClient.Gauge({
    name: "celestia_node_local_node_wallet_balance",
    help: "celestia_node_local_node_wallet_balance",
});

const localNodeHeadOfSampledChainGauge = new promClient.Gauge({
    name: "celestia_node_local_node_head_of_sampled_chain",
    help: "celestia_node_local_node_head_of_sampled_chain",
});

const localNodeHeadOfCatchupGauge = new promClient.Gauge({
    name: "celestia_node_local_node_head_of_catchup",
    help: "celestia_node_local_node_head_of_catchup",
});

const localNodeNetworkHeadHeightGauge = new promClient.Gauge({
    name: "celestia_node_local_node_network_head_height",
    help: "celestia_node_local_node_network_head_height",
});

const localNodeWorkerConcurrencyGauge = new promClient.Gauge({
    name: "celestia_node_local_node_worker_concurrency",
    help: "celestia_node_local_node_worker_concurrency",
});

const localNodeCatchUpDoneGauge = new promClient.Gauge({
    name: "celestia_node_local_node_catch_up_done",
    help: "celestia_node_local_node_catch_up_done",
});

const localNodeIsRunningGauge = new promClient.Gauge({
    name: "celestia_node_local_node_is_running",
    help: "celestia_node_local_node_is_running",
});

const register = new promClient.Registry();

register.clear(); //remove all nodejs metrics default

register.registerMetric(nodeTypeGauge);
register.registerMetric(latestMetricsTimeGauge);
register.registerMetric(upTimeGauge);
register.registerMetric(lastPfbTimestampGauge);
register.registerMetric(pfbCountGauge);
register.registerMetric(headGauge);
register.registerMetric(networkHeightGauge);
register.registerMetric(dasLatestSampledTimestampGauge);
register.registerMetric(dasNetworkHeadGauge);
register.registerMetric(dasSampleChainHeadGauge);
register.registerMetric(dasSampleHeadersCounterGauge);
register.registerMetric(dasTotalSampledHeadersGauge);
register.registerMetric(totalSyncedHeadersGauge);
register.registerMetric(startTimeGauge);
register.registerMetric(lastRestartTimeGauge);
register.registerMetric(nodeRuntimeCounterInSecondsGauge);
register.registerMetric(lastAccumulativeNodeRuntimeCounterInSecondsGauge);
// register.registerMetric(topUptimeGauge);
// register.registerMetric(topPfbCountGauge);
register.registerMetric(bandwithRateInGauge);
register.registerMetric(bandwithRateOutGauge);
register.registerMetric(bandwithTotalInGauge);
register.registerMetric(bandwithTotalOutGauge);
register.registerMetric(localNodeTypeGauge);
register.registerMetric(localNodeApiVersionGauge);
register.registerMetric(localNodeWalletAddressGauge);
register.registerMetric(localNodeWalletBalanceGauge);
register.registerMetric(localNodeHeadOfSampledChainGauge);
register.registerMetric(localNodeHeadOfCatchupGauge);
register.registerMetric(localNodeNetworkHeadHeightGauge);
register.registerMetric(localNodeWorkerConcurrencyGauge);
register.registerMetric(localNodeCatchUpDoneGauge);
register.registerMetric(localNodeIsRunningGauge);

promClient.collectDefaultMetrics({ register });

// Define the endpoint for Prometheus to scrape metrics from
app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", register.contentType);
    res.send(await register.metrics());
});

async function getDataFromCelestia() {
    try {
        let fistPageResponse = await axios.get(`https://leaderboard.celestia.tools/api/v1/nodes/light`);
        let pageCount = +fistPageResponse.data.pagination.total_pages || 0 ;
        let allDatas  = [];
        if(+pageCount <= 1) return allDatas;
        for (let index = 2; index <= pageCount; index++) {
            const response = await axios.get(`https://leaderboard.celestia.tools/api/v1/nodes/light?page=${index}`);
            const nodes = response.data.rows;
            allDatas = allDatas.concat(nodes);
        }
        return allDatas;
    } catch (error) {
        console.error(error);
        return [];
    }
    
}

async function getDataFromLocalNode() {
    try {
        const commandAuth = "export CELESTIA_NODE_AUTH_TOKEN=$(celestia light auth admin --p2p.network blockspacerace)";        
        let localNodeStats = {};
        let dataStats;
        exec(commandAuth, (error, stdout, stderr) => {
            if (error) {
                console.log(`Error auth: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`Error auth: ${stderr}`);
                return;
            }            
            //get bandwith stats
            const commandBandwithStats = 'celestia rpc p2p BandwidthStats';
            exec(commandBandwithStats, (error, stdout, stderr) => {
                if (error) {
                    console.log(`Error: ${error.message}`);                    
                }
                if (stderr) {
                    console.log(`Error: ${stderr}`);                    
                }
                dataStats = JSON.parse(stdout);
                console.log(dataStats);
                localNodeStats.rateInBytePerSecond = dataStats.result.RateIn;
                localNodeStats.rateOutBytePerSecond = dataStats.result.RateOut;
                localNodeStats.totalInByte = dataStats.result.TotalIn;
                localNodeStats.totalOutByte = dataStats.result.TotalOut;
                console.log(localNodeStats);
            });
            //get node info
            const commandNodeInfo = 'celestia rpc node Info';
            exec(commandNodeInfo, (error, stdout, stderr) => {
                if (error) {
                    console.log(`Error: ${error.message}`);                    
                }
                if (stderr) {
                    console.log(`Error: ${stderr}`);                    
                }
                dataStats = JSON.parse(stdout);
                console.log(dataStats);
                localNodeStats.type = dataStats.result.type;
                localNodeStats.apiVersion = dataStats.result.api_version;
                console.log(localNodeStats);
            });
            //get node wallet address
            const commandNodeWallet = 'celestia rpc state AccountAddress';
            exec(commandNodeWallet, (error, stdout, stderr) => {
                if (error) {
                    console.log(`Error: ${error.message}`);                    
                }
                if (stderr) {
                    console.log(`Error: ${stderr}`);                    
                }
                dataStats = JSON.parse(stdout);
                console.log(dataStats);
                localNodeStats.wallet = dataStats.result;
                console.log(localNodeStats);             
            });        
            //get node wallet balance
            const commandNodeBalance = 'celestia rpc state Balance';
            exec(commandNodeBalance, (error, stdout, stderr) => {
                if (error) {
                    console.log(`Error: ${error.message}`);                    
                }
                if (stderr) {
                    console.log(`Error: ${stderr}`);                    
                }
                dataStats = JSON.parse(stdout);
                console.log(dataStats);
                localNodeStats.balance = dataStats.result.amount;
                console.log(localNodeStats);              
            });
            //get sampling stats
            const commandSamplingStats = 'celestia rpc das SamplingStats';
            exec(commandSamplingStats, (error, stdout, stderr) => {
                if (error) {
                    console.log(`Error: ${error.message}`);                    
                }
                if (stderr) {
                    console.log(`Error: ${stderr}`);                    
                }
                dataStats = JSON.parse(stdout);
                console.log(dataStats);
                localNodeStats.headOfSampledChain = dataStats.result.head_of_sampled_chain;
                localNodeStats.headOfCatchup = dataStats.result.head_of_catchup;
                localNodeStats.networkHeadHeight = dataStats.result.network_head_height;
                localNodeStats.worker = dataStats.result.concurrency;
                localNodeStats.catchUpDone = dataStats.result.catch_up_done;
                localNodeStats.isNodeRunning = dataStats.result.is_running;
                console.log(localNodeStats);
            });
        });
        return localNodeStats;        
    } catch (error) {   
        console.error(error);
        return {};
    }    
}

async function updateMetrics() {
    try {        
        let nodes = await getDataFromCelestia();        
        nodes.forEach((node) => {
            nodeTypeGauge.labels(node.node_id).set(node.node_type);
            latestMetricsTimeGauge.labels(node.node_id).set(+dayjs(node.latest_metrics_time));
            upTimeGauge.labels(node.node_id).set(node.uptime);
            lastPfbTimestampGauge.labels(node.node_id).set(+dayjs(node.last_pfb_timestamp));
            pfbCountGauge.labels(node.node_id).set(node.pfb_count);
            headGauge.labels(node.node_id).set(node.head);
            networkHeightGauge.labels(node.node_id).set(node.network_height);
            dasLatestSampledTimestampGauge
                .labels(node.node_id)
                .set(+dayjs(node.das_latest_sampled_timestamp));
            dasNetworkHeadGauge.labels(node.node_id).set(node.das_network_head);
            dasSampleChainHeadGauge.labels(node.node_id).set(node.das_sampled_chain_head);
            dasSampleHeadersCounterGauge.labels(node.node_id).set(node.das_sampled_headers_counter);
            dasTotalSampledHeadersGauge.labels(node.node_id).set(node.das_total_sampled_headers);
            totalSyncedHeadersGauge.labels(node.node_id).set(node.total_synced_headers);
            startTimeGauge.labels(node.node_id).set(+dayjs(node.start_time));
            lastRestartTimeGauge.labels(node.node_id).set(+dayjs(node.last_restart_time));
            nodeRuntimeCounterInSecondsGauge
                .labels(node.node_id)
                .set(node.node_runtime_counter_in_seconds);
            lastAccumulativeNodeRuntimeCounterInSecondsGauge
                .labels(node.node_id)
                .set(node.last_accumulative_node_runtime_counter_in_seconds);
        });
        let localNodeStats = await getDataFromLocalNode();
        if(localNodeStats) {
            bandwithRateInGauge.set(localNodeStats.rateInBytePerSecond);
            bandwithRateOutGauge.set(localNodeStats.rateOutBytePerSecond);
            bandwithTotalInGauge.set(localNodeStats.totalInByte);
            bandwithTotalOutGauge.set(localNodeStats.totalOutByte);
            localNodeTypeGauge.set(localNodeStats.type);
            localNodeApiVersionGauge.set(localNodeStats.apiVersion);
            localNodeWalletAddressGauge.set(localNodeStats.wallet);
            localNodeWalletBalanceGauge.set(localNodeStats.balance);
            localNodeHeadOfSampledChainGauge.set(localNodeStats.headOfSampledChain);
            localNodeHeadOfCatchupGauge.set(localNodeStats.headOfCatchup);
            localNodeNetworkHeadHeightGauge.set(localNodeStats.networkHeadHeight);
            localNodeWorkerConcurrencyGauge.set(localNodeStats.worker);
            localNodeCatchUpDoneGauge.set(localNodeStats.catchUpDone);
            localNodeIsRunningGauge.set(localNodeStats.isNodeRunning);
        }

        //update top uptime score
        // const topUptime = nodes
        //     .map((node) => {
        //         return { 
        //             node_id: node.node_id, 
        //             uptime: +node.uptime 
        //         };
        //     })
        //     .sort((a, b) => b.uptime - a.uptime)
        //     .slice(0, 10);        

        // const topPfb = nodes
        //     .map((node) => {
        //         return { 
        //             node_id: node.node_id, 
        //             pfb_count: +node.pfb_count 
        //         };
        //     })
        //     .sort((a, b) => b.pfb_count - a.pfb_count)
        //     .slice(0, 10);
        
        // topUptimeGauge.set(topUptime);
        // topPfbCountGauge.set(topPfb);

        console.log(`Success in update metrics at ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`);
    } catch (error) {
        console.log(error);
    }
}

// Update metrics every 30 seconds
setInterval(() => {
    updateMetrics();
}, 30 * 1000);

// Start the server
app.listen(port, () => {
    console.log(
        `The app was started successful!\nPlease check metrics at: http://localhost:${port}/metrics`
    );
});
