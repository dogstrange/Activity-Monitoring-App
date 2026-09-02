document.getElementById("save").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const result = await window.api.saveUser({ username, password });
  document.getElementById("info").textContent = result.ok ? "Saved!" : "Failed";
});

document.getElementById("log-in").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const result = await window.api.loginUser({ username, password });

if(result.ok){
  window.location.href = "activity.html"
}else{
  document.getElementById("info").textContent = "Please create an account";
}

});
