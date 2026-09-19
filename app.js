// F-01: 부산 vs 전국 소상공인 체감지수 비교 + 매출 변화율 계산
// docs/requirements.md R-01~R-03 참고

function parseAmount(str) {
  if (typeof str !== "string") return NaN;
  var cleaned = str.replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return NaN;
  return Number(cleaned);
}

function validateSalesInput(currentStr, previousStr) {
  var c = (currentStr || "").trim();
  var p = (previousStr || "").trim();
  if (c === "" || p === "") {
    return { valid: false, message: "이번 달 매출과 작년 같은 달 매출을 모두 입력해 주세요." };
  }
  var cNum = parseAmount(c);
  var pNum = parseAmount(p);
  if (isNaN(cNum) || isNaN(pNum) || cNum <= 0 || pNum <= 0) {
    return { valid: false, message: "매출은 0보다 큰 숫자로 입력해 주세요." };
  }
  return { valid: true, current: cNum, previous: pNum };
}

function calcMyChangeRate(current, previous) {
  var rate = ((current - previous) / previous) * 100;
  return Math.round(rate * 10) / 10;
}

function calcIndexChangeRate(latest, prev) {
  var rate = ((latest - prev) / prev) * 100;
  return Math.round(rate * 10) / 10;
}

// data.js(window.SBIZ_BSI_MONTHLY)에서 경기전반체감 값이 있는 마지막 월(최신월)과
// 그 12개월 전(같은 달, 1년 전) 행을 찾는다.
function getIndexData() {
  var rows = window.SBIZ_BSI_MONTHLY.rows;
  var latestRow = null;
  for (var i = rows.length - 1; i >= 0; i--) {
    var v = rows[i]["경기전반체감"];
    if (v !== null && v !== undefined && v !== "") {
      latestRow = rows[i];
      break;
    }
  }
  if (!latestRow) return null;
  var parts = latestRow.month.split("-");
  var prevMonth = (parseInt(parts[0], 10) - 1) + "-" + parts[1];
  var prevRow = null;
  for (var j = 0; j < rows.length; j++) {
    if (rows[j].month === prevMonth) {
      prevRow = rows[j];
      break;
    }
  }
  if (!prevRow) return null;
  return {
    latestMonth: latestRow.month,
    prevMonth: prevMonth,
    nationalLatest: latestRow["경기전반체감"],
    nationalPrev: prevRow["경기전반체감"],
    busanLatest: latestRow["부산체감"],
    busanPrev: prevRow["부산체감"]
  };
}

function formatPercent(v) {
  var sign = v > 0 ? "+" : "";
  return sign + v.toFixed(1) + "%";
}

function formatNumber(n) {
  return n.toLocaleString("ko-KR");
}
