<script setup lang="ts">
import ChartCard from "@/components/PdChart/index.vue";
import { generateID } from "@/components/PdUpload/utils/index";
import dayjs from "dayjs";
import { ref, watch } from "vue";

const props = defineProps({
  source: {
    type: Object as () => {},
    required: true
  }
});

const priceChartCards = ref({
  name: "priceChartCards" + generateID(),
  title: "价格趋势",
  text: "",
  option: {
    tooltip: {
      trigger: "axis"
    },
    grid: {
      x: 0,
      y: 30,
      x2: 0,
      y2: 5
    },
    xAxis: {
      type: "category",
      data: [],
      show: false
    },
    yAxis: {
      type: "value",
      show: false
    },
    series: [
      {
        data: [],
        type: "line",
        smooth: true,
        markPoint: {
          data: [
            {
              type: "max",
              itemStyle: {
                color: "rgb(34, 197, 94)" // 绿色表示最高点
              },
              symbolSize: 48
            },
            {
              type: "min",
              itemStyle: {
                color: "rgb(239, 68, 68)" // 红色表示最低点
              },
              symbolSize: 48
            }
          ]
        }
      }
    ]
  },
  style: {
    width: "100%",
    borderRadius: "10px",
    border: 0,
    height: "250px"
  },
  calcHeight: 65
});

watch(
  () => props.source,
  (newSource: any) => {
    // console.log("价格趋势:", newSource);

    const xAxisData = [];
    const seriesData = [];

    if (newSource?.costRecordList) {
      for (let i = 0; i < newSource?.costRecordList.length; i++) {
        xAxisData.push(
          dayjs(newSource?.costRecordList[i].updateAt).format("YYYY-MM-DD")
        );
        seriesData.push(newSource?.costRecordList[i].newCost);
      }
    }

    priceChartCards.value = {
      ...priceChartCards.value,
      option: {
        ...priceChartCards.value.option,
        xAxis: {
          ...priceChartCards.value.option.xAxis,
          data: xAxisData
        },
        series: [
          {
            ...priceChartCards.value.option.series[0],
            data: seriesData
          }
        ]
      }
    };
  },
  {
    immediate: true,
    deep: true
  }
);
</script>

<template>
  <div>
    <ChartCard
      :name="priceChartCards.name"
      :title="priceChartCards.title"
      :text="priceChartCards.text"
      :option="priceChartCards.option"
      :style="priceChartCards?.style"
      :calcHeight="priceChartCards?.calcHeight"
    >
    </ChartCard>
  </div>
</template>
