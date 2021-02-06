$(document).ready(function () {
  document.oncontextmenu = function (e) {
    e.preventDefault();
  };
  openForm();
});

function openForm() {
  $("#modal").css('display', 'block');
}

function closeForm() {
  $("#modal").css('display', 'none');
}

function setNickname() {
  var text = $('#nickName').val();
  if (!text || text === '') {
    alert('Enter username first!');
    $('#nickName').css('border', '2px solid red');
    setTimeout(function () {
      $('#nickName').css('border', 'none');
    }, 5000);
    return false;
  }
  playerName = text;
  return true;
}

function insertBr(elem) {
  $('<br>').appendTo($(elem));
}

function serverCfg() {
  if (!setNickname()) return;
  $('#modalContent').html('<br>');
  $('<label>', {
    for: 'mapSelector',
    id: 'mapSelectorLabel',
    text: 'Choose a map: '
  }).appendTo($('#modalContent'));

  $('<select>', {
    id: 'mapSelector',
    name: 'mapSelector',
  }).appendTo($('#modalContent'));
  
  for (var maps = 0; maps < mapList.length; maps++){//подстановка карт в вибор карт
    $('<option>', {
      value: mapList[maps].file,
      text: mapList[maps].desc
    }).appendTo($('#mapSelector'));
  }

  insertBr('#modalContent');

  $('<label>', {
    for: 'serverType',
    id: 'serverTypeLabel',
    text: 'Private server? '
  }).appendTo($('#modalContent'));
  $('<input>', {
    type: 'checkbox',
    name: 'serverType',
    id: 'serverType',
    click: function () {
      if (this.checked) {
        $('#password').css('display', 'inline');
        $('#passwordLabel').css('display', 'inline');
      } else {
        $('#password').css('display', 'none');
        $('#passwordLabel').css('display', 'none');
      }
    }
  }).appendTo($('#modalContent'));

  insertBr('#modalContent');

  $('<label>', {
    for: 'password',
    id: 'passwordLabel',
    text: 'Enter password: ',
    css: {
      display: 'none'
    }
  }).appendTo($('#modalContent'));
  $('<input>', {
    type: 'text',
    id: 'password',
    name: 'password',
    css: {
      display: 'none'
    }
  }).appendTo($('#modalContent'));

  insertBr('#modalContent');
  insertBr('#modalContent');

  $('<button>', {
    class: 'btn',
    text: 'Start server',
    click: function () {
      startServer();
    }
  }).appendTo($('#modalContent'));
  insertBr('#modalContent');
  insertBr('#modalContent');
}

function connectCfg() {
  var rooms;
  if (!setNickname()) return;
  $('#modalContent').html('<span>Server list:</span>');
  socket.emit('listRooms');
  socket.on('roomList', function(data){
    rooms = data;
    logObj('rooms:', rooms);
    $('<div>', {
    id: 'serverList',
    class: 'serverList'
  }).appendTo($('#modalContent'));
  //   $('<div>', {
  //   id: 'serverListItemHeader',
  //   class: 'serverListItem serverListItemHeader',
  //   html: ''
  // }).appendTo($('#serverList'));
  if(rooms.length > 0){
    
    function connect(counter){
      var counter = counter-1;
  $('#modalContent').html('<br>');
  if(rooms[counter].password){
    $('<label>', {
    for: 'roomPassword',
    id: 'roomPasswordLabel',
    text: 'Room password: '
  }).appendTo($('#modalContent'));
  $('<input>', {
    type: 'text',
    id: 'roomPassword',
    name: 'roomPassword',
  }).appendTo($('#modalContent'));
  
  insertBr('#modalContent');
  
  $('<button>', {
    class: 'btn',
    text: 'Connect',
    click: function () {
      socket.emit('join', {
        name: playerName,
        room: rooms[counter].room,
        password: $('#roomPassword').val()
  });
    }
  }).appendTo($('#modalContent'));
  }else{
    socket.emit('join', {
        name: playerName,
        room: rooms[counter].room,
        password: ''
  });
  }
  }
    
    for(var counter = 0; counter < rooms.length; counter++){
      $('<div>', {
    class: 'serverListItem',
    append: $('<span>', {
      text: rooms[counter].name
    }) 
  }).appendTo($('#serverList'));//<span class="material-icons">https</span>
      $('<div>', {
    class: 'serverListItem',
    append: $('<span>', {
      text: rooms[counter].map
    }) 
  }).appendTo($('#serverList'));
      var pass;
      if (rooms[counter].password){
        pass = '<span class="material-icons">https</span>';
      }else{
        pass = '<span class="material-icons">no_encryption_gmailerrorred</span>';
      }
      $('<div>', {
    class: 'serverListItem',
    html: pass
  }).appendTo($('#serverList'));
      $('<div>', {
    class: 'serverListItem',
    append: $('<span>', {
      class: 'material-icons',
      text: 'play_arrow',
      click: function(){
        connect(counter);
      }
    }) 
  }).appendTo($('#serverList'));
    }
  }else{
    
  }
  });
    
  
  socket.on('joinResult', function(data){
    if (data.result){
      map = data.map;
      startClient();
    }else{
      alert(data.text);
    }
  });
}