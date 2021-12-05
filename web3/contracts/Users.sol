pragma solidity ^0.4.9;
pragma experimental ABIEncoderV2;
contract Users{
    struct user{
        address useraddress;
        string name;
        uint state;
    }
    struct game{
        address j1;
        address j2;
        string contractadd;
    }

    user[] users;
    game[] games;
    event newgame(string eventtype,string contadd,address j1,address j2);
    event newuser(string eventtype,string name,address useradd);

    function setgame(address _j1, address _j2, string _contractadd) 
    {
        games.push(game(_j1,_j2,_contractadd));
        emit newgame("newgame",_contractadd,_j1,_j2);
    }

    function getgames(address _j)public returns(string[])
    {
         string[] memory gamesadd=new string[](games.length);
         uint index=0;
        for(uint i=0;i<games.length;i++)
        {
            if(games[i].j1==_j||games[i].j2==_j)
            {
                gamesadd[index]=games[i].contractadd;
                index++;
            }
        }
        return gamesadd;
    }

    
    function register(string _na)
    {
       users.push(user(msg.sender,_na,0));
       emit newuser("newuser",_na,msg.sender);
    }

    function getnum() public returns(uint256)
    {
        return users.length;
    }

    function getaddresses() public returns(address[])
    {
        address[] memory userad=new address[](users.length);
        for(uint i=0;i<users.length;i++)
            userad[i]= users[i].useraddress;
        return userad;
    }

    function getname(address _ad) public returns(string)
    {
        for(uint i=0;i<users.length;i++)
            if(users[i].useraddress==_ad)
                return users[i].name;
        return "";
    }

    
    

    
}
