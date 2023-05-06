const express = require("express");
const promClient = require("prom-client");
const axios = require("axios");
const dayjs = require("dayjs");

const app = express();
const port = 3456;

const nodeCountGauge = new promClient.Gauge({
    name: "celestia_node_count",
    help: "Number of nodes",
    labelNames: ["node_id"],
});

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
