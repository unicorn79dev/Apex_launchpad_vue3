<template>
    <!-- <Line :chart-data="chartData" :options="options"/> -->
    {{ chartData }}
</template>

<script>
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

export default {
    name: 'BarChart',
    components: { Line },
    props: {
		chartdata: {
			type: Object,
			default: () => {
				return {
                    labels:[],
					datasets: [],
				};
			},
		},
		options: {
			type: Object,
			default: null,
		},
	},
    setup() {
        console.log(this.props.chartdata);
    }
    // data() {
    //     return {
    //         chartData: {
    //             labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    //             datasets: [
    //                 {
    //                     label: 'Data One',
    //                     backgroundColor: '#f87979',
    //                     data: [40, 39, 10, 40, 39, 80, 40]
    //                 }
    //             ]
    //         }
    //     }
    // }
}
</script>