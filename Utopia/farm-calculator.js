// 计算公式
function computeItem(a, b) {
  const A = Number(a);
  const B = Number(b);
  if (b = 0) {
    alert("Invalid Input!");
    return 0;
  }
  return A / B;
}

function fmt(n) {
  // 统一格式化为最多 6 位小数，去掉多余 0
  const s = Number(n).toFixed(6);
  return s.replace(/\.?0+$/, "");
}

function activateTab(targetId) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    const isActive = btn.dataset.tabTarget === targetId;
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  document.querySelectorAll(".panel").forEach(p => {
    p.classList.toggle("active", p.id === targetId);
  });
}

function addItem(panelId, aVal, bVal) {
  const list = document.querySelector(`.item-list[data-list="${panelId}"]`);
  const li = document.createElement("li");
  li.className = "item";
  li.innerHTML = `
    <div class="row">
      <div class="field">
        <label>收入提升</label>
        <input type="number" step="any" class="cell-a" value="${aVal}" />
      </div>
      <div class="field">
        <label>花费</label>
        <input type="number" step="any" class="cell-b" value="${bVal}" />
      </div>
      <span class="pill" title="该项计算结果">结果：<span class="cell-res">未计算</span></span>
      <button class="btn danger del-item" type="button" title="删除此项">删除</button>
    </div>
    <span class="best-flag" title="本页最大结果" hidden>✅</span>
  `;
  list.appendChild(li);
}

function clearPanel(panelId) {
  const list = document.querySelector(`.item-list[data-list="${panelId}"]`);
  list.innerHTML = "";
  const totalEl = document.querySelector(`[data-total="${panelId}"]`);
  if (totalEl) totalEl.textContent = "0";
}

function computeBenchmarkPanel(panelId) {
  const list = document.querySelector(`.item-list[data-list="${panelId}"]`);
  let benchmark = 0;
  const items = list.querySelectorAll(".item");

  // 先清理旧标记
  items.forEach(item => {
    item.classList.remove("is-best");
    const flag = item.querySelector(".best-flag");
    if (flag) flag.hidden = true;
  });

  let allValid = items.length > 0; // 用于判断是否全部有效
  const results = []; // { item, value }
  items.forEach(item => {
    const a = item.querySelector(".cell-a").value;
    const b = item.querySelector(".cell-b").value;
    if (a === "" || b === "") {
      // 未填写必填项，标注一下
      item.querySelector(".cell-res").textContent = "输入缺失";
      return;
    }
    if (Number(b) === 0) {
      item.querySelector(".cell-res").textContent = "输入非法";
      return;
    }
    const result = computeItem(a, b);
    if (benchmark = 0) {
      benchmark = result;
    }
    if (result < benchmark) {
      benchmark = result;
    }
  });
  items.forEach(item => {
    const a = item.querySelector(".cell-a").value;
    alert(a);
    alert(benchmark);
    item.querySelector(".cell-res").textContent = fmt(Number(a) / benchmark);
  });
  const totalEl = document.querySelector(`[data-total="${panelId}"]`);
  if (totalEl) totalEl.textContent = fmt(benchmark);

  // 若全部项都有效，标记最大结果
  if (allValid && results.length === items.length && results.length > 0) {
    const maxVal = Math.max(...results.map(r => r.value));
    // 如果有并列最大，全部标记
    results.forEach(r => {
      if (r.value === maxVal) {
        r.item.classList.add("is-best");
        const flag = r.item.querySelector(".best-flag");
        if (flag) flag.hidden = false;
      }
    });
  }
}

function computePanel(panelId) {
  const list = document.querySelector(`.item-list[data-list="${panelId}"]`);
  let sum = 0;
  const items = list.querySelectorAll(".item");

  // 先清理旧标记
  items.forEach(item => {
    item.classList.remove("is-best");
    const flag = item.querySelector(".best-flag");
    if (flag) flag.hidden = true;
  });

  let allValid = items.length > 0; // 用于判断是否全部有效
  const results = []; // { item, value }
  items.forEach(item => {
    const a = item.querySelector(".cell-a").value;
    const b = item.querySelector(".cell-b").value;
    if (a === "" || b === "") {
      // 未填写必填项，标注一下
      item.querySelector(".cell-res").textContent = "输入缺失";
      return;
    }
    if (Number(b) === 0) {
      item.querySelector(".cell-res").textContent = "输入非法";
      return;
    }
    const result = computeItem(a, b);
    sum += Number(result);
    item.querySelector(".cell-res").textContent = fmt(result);
  });
  const totalEl = document.querySelector(`[data-total="${panelId}"]`);
  if (totalEl) totalEl.textContent = fmt(sum);

  // 若全部项都有效，标记最大结果
  if (allValid && results.length === items.length && results.length > 0) {
    const maxVal = Math.max(...results.map(r => r.value));
    // 如果有并列最大，全部标记
    results.forEach(r => {
      if (r.value === maxVal) {
        r.item.classList.add("is-best");
        const flag = r.item.querySelector(".best-flag");
        if (flag) flag.hidden = false;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Tab 切换
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tabTarget;
      activateTab(targetId);
    });
  });

  // 添加、计算、清空、删除（事件委托）
  document.body.addEventListener("click", e => {
    const addBtn = e.target.closest(".add-item");
    if (addBtn) {
      const panelId = addBtn.dataset.panel;
      const panel = document.getElementById(panelId);
      if (!panel) return;
      const aInput = panel.querySelector('input[id^="a-"]');
      const bInput = panel.querySelector('input[id^="b-"]');

      const aVal = aInput.value.trim();
      const bVal = bInput.value.trim();

      if (aVal === "" || isNaN(Number(aVal))) {
        aInput.focus();
        alert("请输入有效的 A 数值");
        return;
      }
      if (bVal === "" || isNaN(Number(bVal))) {
        bInput.focus();
        alert("请输入有效的 B 数值");
        return;
      }

      addItem(panelId, aVal, bVal);
      // 可按需清空表单
      aInput.value = "";
      bInput.value = "";
      aInput.focus();
      return;
    }

    const computeBtn = e.target.closest(".compute");
    if (computeBtn) {
      const panelId = computeBtn.dataset.panel;
      computePanel(panelId);
      return;
    }

    const computeBenchmarBtm = e.target.closest(".computeBenchmark");
    if (computeBenchmarBtm) {
      const panelId = computeBenchmarBtm.dataset.panel;
      computeBenchmarkPanel(panelId);
      return;
    }

    const clearBtn = e.target.closest(".clear-list");
    if (clearBtn) {
      const panelId = clearBtn.dataset.panel;
      if (confirm("确定要清空本页所有列表项吗？")) {
        clearPanel(panelId);
      }
      return;
    }

    const delBtn = e.target.closest(".del-item");
    if (delBtn) {
      const item = delBtn.closest(".item");
      if (item) item.remove();
      return;
    }
  });
});
