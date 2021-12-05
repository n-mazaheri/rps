const updateRPS = (Hasher, RPS, Users, web3) => {

  var gameState;
  var selectedContract;

  $(() => {


    var getNameDlg = new bootstrap.Modal(document.getElementById("getNameDlg"), {
      keyboard: false,
      backdrop: "static",
    });
    $("#getNameDlgBtnClose").on("click", () => {
      getNameDlg.hide();
    });
    $("#getNameDlgBtnOk").on("click", () => {
      let name = $("#inputName").val();
      Users.methods.register(name).send({ from: web3.currentProvider.selectedAddress }).then(() => {
        showName(name);
      });
      getNameDlg.hide();
    });
    $("#btnInviteToPlay").on("click", () => {
      //$('.toast').toast('show');
      changeGameState(1);
    });
    $(".btnAction").on("click", (e) => {

      let action = $(e.currentTarget).data("action");
      if (gameState == 1) {
        let user2 = $('#inputState').val();
        let salt = Math.floor(Math.random() * (1000));
        let bet = $('#inputBet').val();
        newGame(action, salt, user2, bet);
        changeGameState(6);
      } if (gameState == 2) {
        let salt = localStorage.getItem(selectedContract.options.address);
        selectedContract.methods.solve(action, salt).send({ from: web3.currentProvider.selectedAddress });
        //confirm selectedContract
      }
      if (gameState == 3) {

        selectedContract.methods.stake().call().then((stake) => {

          selectedContract.methods.play(action).send({ from: web3.currentProvider.selectedAddress, value: stake });
        });
        changeGameState(6);
        //move selectedContract
      }
    });
    $(".btnSelectGame").on("click", (e) => {
      let contractid = $(e.currentTarget).data("contractid");
      //console.log(contractid);
    });

    $('#select1').on('change', function () {
      getContract(this.value).then((contract) => {
        selectedContract = contract;
        reloadGameFor(contract);
      });
    });

    function reloadGameFor(contract) {
      contract.methods.getstate().call().then((_state) => {
        let state = _state[0];
        let j1 = _state[1];
        let j2 = _state[2];
        let ownerAddress = web3.currentProvider.selectedAddress;
        if (j1.toLowerCase() == ownerAddress.toLowerCase()) {
          if (state == 1)
            changeGameState(4);
          else if (state == 2) {
            changeGameState(2);
          }
          else if (state == 3)
            changeGameState(5);
        }
        else if (j2.toLowerCase() == ownerAddress.toLowerCase()) {
          if (state == 1) {
            changeGameState(3);
          }
          else if (state == 2)
            changeGameState(4);
          else if (state == 3)
            changeGameState(5);
        }
        let add2 = j1.toLowerCase() == ownerAddress.toLowerCase() ? j2 : j1;
        Users.methods.getname(add2).call().then((name) => {
          $('#gameTitle').text('Game with ' + name);
        });
        contract.methods.stake().call().then((stake) => {
          $('#gameStake').text('  ' + web3.utils.fromWei(stake, 'ether'));
        });
      });
    }
    function changeGameState(state) {
      gameState = state;
      $('#gameTitle').text('');
      $('#gameStake').text('');
      if (state == 0) {
        $('#lblGameMessage').text('Please select a pending game(if any) or create a new game.');
        $(".btnAction").attr("disabled", true);
      }
      if (state == 1) {
        $('#lblGameMessage').text('Please select your first move ');
        $(".btnAction").attr("disabled", false);
      }
      if (state == 2) {
        $('#lblGameMessage').text('please confirm your initial move');
        $(".btnAction").attr("disabled", false);
      }
      if (state == 3) {
        $('#lblGameMessage').text('Please select a move');
        $(".btnAction").attr("disabled", false);
      }
      if (state == 4) {
        $('#lblGameMessage').text('Please wait for other player');
        $(".btnAction").attr("disabled", true);
      }
      if (state == 5) {
        let winner; let j1;
        selectedContract.methods.winner().call().then((winner) => {
          selectedContract.methods.j1().call().then((j1) => {
            let owner = web3.currentProvider.selectedAddress.toLowerCase();
            var w = '';
            //console.log(winner);
            if ((winner == 1 && owner == j1.toLowerCase()) || (winner == 2 && owner != j1.toLowerCase()))
              w = ' You won the game. '
            if ((winner == 1 && owner != j1.toLowerCase()) || (winner == 2 && owner == j1.toLowerCase()))
              w = ' You lost the game. '
            if (winner == 3)
              w = 'You were in a tie or a timeout was occured. '
            $('#lblGameMessage').text('The game finished. ' + w);
          });
        });
        $('#lblGameMessage').text('The game finished. ');
        $(".btnAction").attr("disabled", true);
      }
      if (state == 6) {
        $('#lblGameMessage').text('Please wait for network ...');
        $(".btnAction").attr("disabled", true);
      }
    }


    function addToGameList(name, element) {
      //console.log(3);
      let id = Math.random().toString(36).substring(7);

      if ($("#select1 option[value='" + element + "']").length == 0) {
        $('#select1').append("<option class='selectoption' value=" + element + "> Game with " + name + "</option>");
      }

    }
    function addToUserList(name, address) {
      let ownerAddress = web3.currentProvider.selectedAddress.toLowerCase()
      if (address.toLowerCase() != ownerAddress && $("#inputState option[value='" + address + "']").length == 0) {
        $('#inputState').append("<option value=" + address + ">" + name + "</option>");
      }
    }

    function showName(name) {
      $('#palyeName').append("Hello  " + name + "! ");
    }
    checkRegisteration((name, flag) => {
      if (flag == false) {
        getNameDlg.show();
      }
      else {
        showName(name);
        getpendingcontract((contract) => {
          setNewGameEvent(contract);
          contract.methods.j1().call().then((j1) => {
            contract.methods.j2().call().then((j2) => {
              var element = j1;
              if (web3.currentProvider.selectedAddress.toLowerCase() == j1.toLowerCase()) {
                element = j2;
              }
              Users.methods.getname(element).call().then((name) => {
                addToGameList(name, contract.options.address);
              });
            });



          });

        });
      }
    });

    getUsers((element, name) => {
      addToUserList(name, element);
    });

    Users.events.newgame()
      .on('data', (event) => {
        //console.log(event.returnValues[1]);
        getContract(event.returnValues[1]).then((contract) => {
          var element = event.returnValues[2];
          if (web3.currentProvider.selectedAddress.toLowerCase() == element.toLowerCase()) {
            element = event.returnValues[3];
          }
          Users.methods.getname(element).call().then((name) => {
            addToGameList(name, event.returnValues[1]);
            setNewGameEvent(contract);
            $('#select1').val('');
          });
        });

      })
      .on('error', console.error);

    Users.events.newuser()
      .on('data', (event) => {
        addToUserList(event.returnValues[1], event.returnValues[2]);
      })
      .on('error', console.error);




    async function newGame(move, salt, user2, bid) {
      const continf = await $.getJSON("js/contracts/RPS.json");
      let hash = await Hasher.methods.hash(move, salt).call();
      RPS.deploy({
        data: continf.bytecode
        , arguments: [hash, user2]
      }).send({
        from: web3.currentProvider.selectedAddress,
        value: web3.utils.toWei(bid, 'ether')

      }).then(function (newContractInstance) {
        selectedContract = newContractInstance
        reloadGameFor(newContractInstance)
        localStorage.setItem(newContractInstance.options.address, salt);
        Users.methods.setgame(web3.currentProvider.selectedAddress, user2, newContractInstance.options.address.toString()).send({ from: web3.currentProvider.selectedAddress });

      });
    }

    function checkRegisteration(callb) {

      Users.methods.getaddresses().call().then((addresses) => {
        flag = false;
        addresses.forEach(element => {

          if (element.toLowerCase() == web3.currentProvider.selectedAddress.toLowerCase()) {
            flag = true;
          }
        });
        if (flag == true) {
          Users.methods.getname(web3.currentProvider.selectedAddress).call().then((name) => {
            callb(name, true)
          });
        }
        else {
          callb("", false);
        }
      });
    }

    function setNewGameEvent(contract) {
      contract.events.newstate()
        .on('data', (event) => {
          if (selectedContract != null && selectedContract.options.address.toLowerCase() == contract.options.address.toLowerCase()) {
            reloadGameFor(contract);
          }
          scheduleTask(contract)
        })
        .on('error', console.error);
      scheduleTask(contract);
    }

    function scheduleTask(contract) {

      contract.methods.lastAction().call().then((lastaction) => {

        let timeout = 305000 - (Date.now() - lastaction * 1000);
        if (timeout < 0)
          timeout = 1;

        contract.methods.state().call().then((state) => {
          if (state == 1)
            setTimeout(() => {
              contract.methods.state().call().then((state2) => {
                if (state2 == 1)
                  contract.methods.j2Timeout().send({ from: web3.currentProvider.selectedAddress });
              });
            }, timeout);
          else if (state == 2)
            setTimeout(() => {
              contract.methods.state().call().then((state2) => {
                if (state2 == 2)
                  contract.methods.j1Timeout().send({ from: web3.currentProvider.selectedAddress });
              });
            }, timeout);
        });
      });



    }


    changeGameState(0);


  });




  function getUsers(callb) {
    Users.methods.getaddresses().call().then((addresses) => {
      addresses.forEach(element => {
        Users.methods.getname(element).call().then((name) => {
          callb(element, name);
          //$('#addlist').append("<option value="+element+">"+element+"</option>");
        })
      });

    });
  }
  async function getContract(contractadd) {
    const continf = await $.getJSON("js/contracts/RPS.json");
    //console.log(continf.abi);
    const contract = new web3.eth.Contract(continf.abi, contractadd);
    return contract;

  }


  async function getpendingcontract(callb) {
    const continf = await $.getJSON("js/contracts/RPS.json");
    Users.methods.getgames(web3.currentProvider.selectedAddress).call().then((addresses) => {
      addresses.forEach(element => {
        if (element != "") {
          const contract = new web3.eth.Contract(continf.abi, element)
          callb(contract);
        }
      });
    });
  }




}



////////////
const getWeb3 = () => {
  return new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // ask user permission to access his accounts
          await window.ethereum.request({ method: "eth_requestAccounts" });
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else {
        reject("Must install MetaMask");
      }
    });
  });
};
const getusers = async (web3) => {
  const data = await $.getJSON("js/contracts/Users.json");

  const netId = await web3.eth.net.getId();
  const deployedNetwork = data.networks[netId];
  const RPS = new web3.eth.Contract(
    data.abi,
    deployedNetwork && deployedNetwork.address
  );
  return RPS;
};
const getHasher = async (web3) => {
  const data = await $.getJSON("js/contracts/Hasher.json");

  const netId = await web3.eth.net.getId();
  const deployedNetwork = data.networks[netId];
  const RPS = new web3.eth.Contract(
    data.abi,
    deployedNetwork && deployedNetwork.address
  );
  return RPS;
};

const getRPS = async (web3) => {
  const data = await $.getJSON("js/contracts/RPS.json");

  const netId = await web3.eth.net.getId();
  const deployedNetwork = data.networks[netId];
  const RPS = new web3.eth.Contract(
    data.abi,
    deployedNetwork && deployedNetwork.address
  );
  return RPS;
};


async function RPSApp() {

  const web3 = await getWeb3();
  const Users = await getusers(web3);
  const Hasher = await getHasher(web3);
  const RPS = await getRPS(web3);
  updateRPS(Hasher, RPS, Users, web3);

}
RPSApp();
