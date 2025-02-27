<template>
  <div id="map"></div>
  <!-- <VideoDialog ref="dialogRef" /> -->
  <!-- <div id="popup" style="width: 100px; height: 100px; background: #000"></div> -->
</template>

<script setup>
import { onMounted, ref, useTemplateRef } from "vue";
import { Map, View, Overlay } from "ol";
import TileLayer from "ol/layer/Tile";
import SourceVector from "ol/source/Vector";
import LayerVector from "ol/layer/Vector";
import Cluster from "ol/source/Cluster.js";
import { boundingExtent } from "ol/extent.js";
// import OSM from "ol/source/OSM";
import { Circle, Fill, Stroke, Style, Text, Icon } from "ol/style";
import { fromLonLat } from "ol/proj";
import { toStringXY } from "ol/coordinate";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import GeoJSON from "ol/format/GeoJSON";
import videoIcon from "./assets/images/video-icon.png";
import VideoDialog from "./components/VideoDialog.vue";

const map = ref(null);
const dialogRef = useTemplateRef("dialogRef");

const labelStyle = new Style({
  text: new Text({
    font: "12px Calibri,sans-serif",
    overflow: true,
    // 填充色
    fill: new Fill({
      color: "#64B2DC",
    }),
    // // 描边色
    stroke: new Stroke({
      color: "#64B2DC",
      width: 0.5,
    }),
  }),
});
// GeoJson图层列表
const vectorsJson = [
  // 世界线
  {
    file: "word",
    style: new Style({
      fill: new Fill({
        color: "#101840",
      }),
      // stroke: new Stroke({
      //   color: "#813244",
      //   width: 2,
      // }),
    }),
  },
  // 国界线
  {
    file: "china",
    style: new Style({
      fill: new Fill({
        color: "#101840",
      }),
      stroke: new Stroke({
        color: "#813244",
        width: 2,
      }),
    }),
  },
  // 铁路
  {
    file: "railway",
    style: new Style({
      stroke: new Stroke({
        color: "#868F9A",
        width: 1,
      }),
    }),
  },
  // 湖域
  {
    file: "lakes",
    style: new Style({
      fill: new Fill({
        color: "#0B1133",
      }),
    }),
  },
  // 1河流
  {
    file: "levelOneRver",
    style: new Style({
      stroke: new Stroke({
        color: "#0B1133",
        width: 1,
      }),
      fill: new Fill({
        color: "#0B1133",
      }),
    }),
  },
  // 2河流
  {
    file: "levelTwoRver",
    style: new Style({
      stroke: new Stroke({
        color: "#0B1133",
        width: 1,
      }),
      fill: new Fill({
        color: "#0B1133",
      }),
    }),
  },
  // 3河流
  {
    file: "levelThreeRver",
    style: new Style({
      stroke: new Stroke({
        color: "#0B1133",
        width: 1,
      }),
      fill: new Fill({
        color: "#0B1133",
      }),
    }),
  },
  // 4河流
  {
    file: "levelFourRver",
    style: new Style({
      stroke: new Stroke({
        color: "#0B1133",
        width: 1,
      }),
      fill: new Fill({
        color: "#0B1133",
      }),
    }),
  },
  // 省份
  {
    file: "province",
    style: new Style({
      stroke: new Stroke({
        color: "#969CA5",
        width: 1,
      }),
    }),
  },
  // 县级边界
  {
    file: "countyBoundaries",
    style: new Style({
      stroke: new Stroke({
        color: "#969CA5",
        width: 1,
      }),
    }),
  },
  // 公路
  {
    file: "highway",
    style: new Style({
      stroke: new Stroke({
        color: "#0D1638",
        width: 4,
      }),
    }),
  },
  // 市级城市
  {
    file: "city",
    style: function (feature) {
      const label = feature.get("name").split(" ").join("\n");
      labelStyle.getText().setText(label);
      return [labelStyle];
    },
  },
  // 省会城市
  {
    file: "pc",
    style: function (feature) {
      const label = feature.get("name").split(" ").join("\n");
      labelStyle.getText().setText(label);
      return [labelStyle];
    },
  },
  // 区县名
  {
    file: "district",
    style: function (feature) {
      const label = feature.get("NAME").split(" ").join("\n");
      labelStyle.getText().setText(label);
      return [labelStyle];
    },
  },
];

const mapData = ref([
  {
    name: "坐标点1",
    longitude: 116.06764901057994,
    latitude: 39.891928821865775,
  },
  {
    name: "坐标点2",
    longitude: 114.06764901057994,
    latitude: 39.59583,
  },
]);

const geojsonSource = () => {
  const result = [];
  for (let i = 0; i < vectorsJson.length; i++) {
    const { type, file, style } = vectorsJson[i];
    if (type === "text") {
      console.log(result);
    } else {
      result.push(
        new SourceVector({
          url: `/${file}.json`, // 第一个 GeoJSON 文件的路径
          format: new GeoJSON({
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
          }),
        })
      );
    }
  }
  return result;
};

/**
 *
 * @param index 第几个图层 0 1 2 3 4 5
 * @param bool 显示或隐藏
 */
const toggleLayer = (index, bool) => {
  let layers = map.value.getLayers();
  let layer = layers.getArray()[index];
  layer.setVisible(bool);
};

// 获取图层
const getLayers = () => {
  const layers = [];
  const sources = geojsonSource();
  for (let i = 0; i < sources.length; i++) {
    layers.push(
      new LayerVector({
        source: sources[i],
        style: vectorsJson[i].style,
      })
    );
  }
  return layers;
};

/**
 * 在地图上设置一个标注。
 *
 * @param {string} type - 要设置的标注类型。
 * @param {Object} [config={src|text color}] - 标注的其他配置选项。
 * @param {Array<number>} [lonLat] - 标注的经纬度坐标。默认为 [104.24199, 35.21163]。
 * @param {Array<Object>} [data] - 点击标注的数据数
 * @returns {Array<LayerVector>} - 返回一个包含标注图层的数组。
 */
const setMark = (type, config = {}, lonLat = [103.24199, 35.21163], data) => {
  const vectorSource = new SourceVector();
  const vectorLayer = new LayerVector({
    source: vectorSource,
  });

  // 用于充当标注的要素
  const labelFeature = new Feature({
    geometry: new Point(fromLonLat(lonLat)),
    data,
  });
  let style = null;
  switch (type) {
    case "img":
      style = new Style({
        image: new Icon({
          // anchor: [0.5, 0.5],//图标的锚点,经纬度点所对应的图标的位置，默认是[0.5, 0.5]，即为标注图标的中心点位置
          // anchorOrigin: "top-right", //锚点的偏移位置，默认是top-left，
          // anchorXUnits: "fraction", //锚点X的单位，默认为百分比，也可以使用px
          // anchorYUnits: "pixels", //锚点Y的单位，默认为百分比，也可以使用px
          offsetOrigin: "bottom-right", //原点偏移bottom-left, bottom-right, top-left, top-right,默认 top-left
          // offset:[0,10],
          //图标缩放比例
          scale: 0.8, //可以设置该比例实现，图标跟随地图层级缩放
          //透明度
          opacity: 0.75, //如果想隐藏某个图标，可以单独设置该值，透明度为0时，即可隐藏，此为隐藏元素的方法之一。
          //图标的url
          src:
            config.src ||
            "https://openlayers.org/en/latest/examples/data/icon.png",
        }),
      });
      break;
    case "text":
      style = new Style({
        text: new Text({
          font: "16px Calibri,sans-serif",
          text: config.text || "标注",
          fill: new Fill({
            // color: "rgba(255, 0, 0, 1)",
            color: config.color || "rgba(255, 0, 0, 1)",
          }),
        }),
      });
      break;
    default:
      style = new Style({
        image: new Icon({
          // anchor: [0.5, 0.5],//图标的锚点,经纬度点所对应的图标的位置，默认是[0.5, 0.5]，即为标注图标的中心点位置
          // anchorOrigin: "top-right", //锚点的偏移位置，默认是top-left，
          // anchorXUnits: "fraction", //锚点X的单位，默认为百分比，也可以使用px
          // anchorYUnits: "pixels", //锚点Y的单位，默认为百分比，也可以使用px
          // offsetOrigin: "top-right", //原点偏移bottom-left, bottom-right, top-left, top-right,默认 top-left
          // offset:[0,10],
          //图标缩放比例
          scale: 0.5, //可以设置该比例实现，图标跟随地图层级缩放
          //透明度
          opacity: 0.75, //如果想隐藏某个图标，可以单独设置该值，透明度为0时，即可隐藏，此为隐藏元素的方法之一。
          //图标的url
          src:
            config.src ||
            "https://openlayers.org/en/latest/examples/data/icon.png",
        }),
        text: new Text({
          font: "16px Calibri,sans-serif",
          text: config.text || "标注",
          fill: new Fill({
            // color: "rgba(255, 0, 0, 1)",
            color: config.color || "rgba(255, 0, 0, 1)",
          }),
        }),
      });
      break;
  }

  // 设置标注的样式
  labelFeature.setStyle(style);

  // 将标注要素添加到矢量图层中
  vectorSource.addFeature(labelFeature);
  map.value.addLayer(vectorLayer);

  return vectorLayer;
};

// 创建标注弹窗
const addMarker = (xy) => {
  console.log(xy);
  // const popup = dialogRef.value;
  popup.showPopup = true;
  var marker = new Overlay({
    position: xy,
    element: document.querySelector("#popup"),
    stopEvent: false,
    autoPan: false, // 定义弹出窗口在边缘点击时候可能不完整 设置自动平移效果
    autoPanAnimation: {
      duration: 250, //自动平移效果的动画时间 9毫秒）
    },
  });
  map.value.addOverlay(marker);
};

/**
 * ============== start 聚合点位
 */

// 基础样式
const basePointStyle = new Style({
  image: new Icon({
    src: videoIcon,
    scale: 1,
    anchor: [0.5, 0.5],
    rotateWithView: true,
    rotation: 0,
    opacity: 1,
  }),
  count: 1,
});

// 根据范围随机生成经纬度点位 rangeArr = [minLat, maxLat, minLon, maxLon]
const createPointsByRange = (
  num,
  rangeArr = [39.9037, 40.9892, 115.2, 117.4]
) => {
  const [minLat, maxLat, minLon, maxLon] = rangeArr;
  const points = [];
  for (var i = 0; i < num; i++) {
    var lat = Math.random() * (maxLat - minLat) + minLat;
    var lon = Math.random() * (maxLon - minLon) + minLon;
    points.push([lon, lat]);
  }
  return points;
};

const currentDis = ref(150);
// 根据数据创建聚合图层
const createCluster = (points, zindex) => {
  const features = points.map((e) => {
    // ol.proj.fromLonLat用于将经纬度坐标从 WGS84 坐标系转换为地图投影坐标系
    const feature = new Feature({
      geometry: new Point(fromLonLat(e)),
      custom: {
        id: Math.ceil(Math.random() * 100000),
      },
    });
    return feature;
  });
  // 根据points创建一个新的数据源和要素数组，
  const vectorSource = new SourceVector({
    features,
  });

  // 根据点位创建聚合资源
  const clusterSource = new Cluster({
    distance: currentDis.value, // 设置多少像素以内的点位进行聚合
    source: vectorSource,
  });
  // 创建带有数据源的矢量图层，将创建的聚合字段作为source
  const clusters = new LayerVector({
    source: clusterSource,
    style: (feature) => {
      return setFeatureStyle(feature); // 设置聚合点的样式
    },
  });
  // 将矢量图层添加到地图上
  map.value.addLayer(clusters);
  // sv.setZIndex(zindex) // 设置层级
  return clusters;
};

const countStyles = {};
// 生成点位聚合显示的数字样式
const createCountPointStyle = (size) => {
  // 计算一个动态的 radius
  const radius = 20 + Math.max(0, String(size).length - 2) * 10;
  // const rcolor =
  //   '#' +
  //   parseInt(Math.random() * 0xffffff)
  //     .toString(16)
  //     .padStart(6, '0')
  return new Style({
    image: new Circle({
      radius,
      stroke: new Stroke({
        color: "#fff",
      }),
      fill: new Fill({
        color: "#3399CC",
      }),
    }),
    text: new Text({
      text: size.toString(),
      fill: new Fill({
        color: "#fff",
      }),
      scale: 2,
      textBaseline: "middle",
    }),
  });
};

// 设置聚合点的样式
const setFeatureStyle = (feature) => {
  // 获取聚合点小有几个点位
  const size = feature.get("features").length;
  // 设置聚合点的count参数
  feature.set("count", size);
  // 如果是1，直接展示点位的样式
  if (size === 1) {
    return basePointStyle;
  } else {
    // 如果是聚合点，查看countStyles是否存储了这个聚合点的数字样式，如果不存在，生成一个并存储
    if (!countStyles[size]) {
      countStyles[size] = createCountPointStyle(size);
    }
    return countStyles[size];
  }
};

/**
 * ============== end
 */

const initMap = () => {
  map.value = new Map({
    target: "map",
    layers: getLayers(),
    view: new View({
      // projection:'EPSG:3857',
      center: fromLonLat([104.912777, 34.730746]),
      zoom: 2,
    }),
  });
  const vlText = setMark("text", { text: "中华人民共和国" });
  const vlImg = [];
  // mapData.value.forEach((item) => {
  //   vlImg.push(
  //     setMark("img", { src: videoIcon }, [item.longitude, item.latitude], item)
  //   );
  // });
  // 缩放显示隐藏层级
  const zoomChange = function (e) {
    var zoom = parseInt(map.value.getView().getZoom()); //获取当前地图的缩放级别
    if (zoom <= 3) {
      vlText.setVisible(true);
      vectorsJson.forEach((item, i) => {
        if ([0, 1, 4].includes(i)) {
          toggleLayer(i, true);
        } else {
          toggleLayer(i, false);
        }
      });
    } else if (zoom > 3 && zoom < 7) {
      vlText.setVisible(false);
      vectorsJson.forEach((item, i) => {
        if ([0, 1, 5, 8, 12].includes(i)) {
          toggleLayer(i, true);
        } else {
          toggleLayer(i, false);
        }
      });
    } else if (zoom >= 7 && zoom < 9) {
      vlText.setVisible(false);
      vectorsJson.forEach((item, i) => {
        if ([0, 1, 6, 8, 10, 11].includes(i)) {
          toggleLayer(i, true);
        } else {
          toggleLayer(i, false);
        }
      });
    } else if (zoom >= 9 && zoom < 10) {
      vlText.setVisible(false);
      vectorsJson.forEach((item, i) => {
        if ([0, 1, 3, 7, 10, 11].includes(i)) {
          toggleLayer(i, true);
        } else {
          toggleLayer(i, false);
        }
      });
    } else if (zoom >= 10) {
      vlText.setVisible(false);
      vectorsJson.forEach((item, i) => {
        if ([0, 1, 3, 7, 9, 10, 12, 13].includes(i)) {
          toggleLayer(i, true);
        } else {
          toggleLayer(i, false);
        }
      });
    }
  };
  map.value.getView().on("change:resolution", zoomChange);
  zoomChange();

  // 点击标注
  // map.value.on("singleclick", function (e) {
  //   console.log(e.coordinate);
  //   if (map.value.hasFeatureAtPixel(e.pixel)) {
  //     var features = map.value.getFeaturesAtPixel(e.pixel);
  //     features.forEach((feature) => {
  //       const coordinates = feature.getGeometry().getCoordinates();
  //       const data = feature.get("data");
  //       if (mapData.value.find((v) => data?.name === v.name)) {
  //         console.log("点击了", data.name);
  //         console.log(coordinates);

  //         addMarker(fromLonLat(coordinates, "EPSG:4326"));
  //       }
  //     });
  //   }
  // });

  const points = createPointsByRange(100);
  const clusters = createCluster(points);

  map.value.on("click", (e) => {
    clusters.getFeatures(e.pixel).then((clickedFeatures) => {
      if (clickedFeatures.length) {
        // Get clustered Coordinates
        const features = clickedFeatures[0].get("features");
        console.log(features);
        if (features.length > 1) {
          const extent = boundingExtent(
            features.map((r) => r.getGeometry().getCoordinates())
          );
          map.value
            .getView()
            .fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
        } else {
          console.log("点击了坐标点");
        }
      }
    });
  });

  // 监听鼠标移动事件，鼠标移动到feature区域时变为手形
  // map.value.on("pointermove", function (e) {
  //   var pixel = map.value.getEventPixel(e.originalEvent);
  //   var hit = map.value.hasFeatureAtPixel(pixel);
  //   map.value.getTargetElement().style.cursor = hit ? "pointer" : "";
  // });
};

onMounted(() => {
  initMap();
});
</script>

<style scoped>
#map {
  background-color: #0b1133;
}
</style>
