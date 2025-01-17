var currentScripturl;
var currentMediaPath;
var currentMediaUrl;
var userInput = "";
var currnectMediapath;
var pageLevel;
var userAnswer;
var userSelectedItem;
var userAnswerSpendTime = 0;
var PresentationIDObj = {};
var PresentationHistoryObj = {};
var idleTime = 0;
var maxIdle = 0;
var repeatList = [];
var repeatTimes = 0;
var repeatStatus = false;
var waitForUserResponse = false;
var waitForMediaResponse = false;
var currentLessonInfoObj;
var nextButtonStatus = false;
var replayVideo = false;
var replayVideoTimes = 0;
var getMediaFeedBackData;
var getMediaFeedBack = false;
var pageStartTimestamp;
var mediaActions = "";
//lesson config
var isHasProgressBar = false;
var isHasNextButton = false;
var isHasVideo = false;
var videoId;
var getQuestionName = "";
var allLessonsInfoObj;
var talkingHeadSpeechEndTimestamp;
var ShowButtonAndWait=false;
var isQuestionPageAfterFirst=false;
var isFirstTimer=true;
var talkingheadUsing="Speak2";
var SpeakRepeatList = [];

var DEBUGGING=qs("DEBUGGING","0");

var TRANSSCRIPT_CTRL = "transcript";
function setCurrentLessonInfo(lessonID) {

	for (var i in allLessonsInfoObj) {
		var lessonStatus = false;
		if (lessonID.toLowerCase() == allLessonsInfoObj[i].lessonId.toLowerCase()) {
			var LessonInfo = allLessonsInfoObj[i];
			sessionStorage.setItem("LessonName", LessonInfo.lessonName);
			sessionStorage.setItem("LessonID", LessonInfo.lessonId);
			sessionStorage.setItem("LessonInfo", JSON.stringify(LessonInfo));
			return true;

		} else {
			sessionStorage.setItem("LessonName", null);
			sessionStorage.setItem("LessonID", null);
			sessionStorage.setItem("LessonInfo", null);

		}


	}

	return false;

}
function addRepeatSpeech(agent_speech)
{
	var currentAgent_Speech = agent_speech.split(":");
	if(currentAgent_Speech.length<2||currentAgent_Speech[1].trim()=="")return;
	if(SpeakRepeatList.length>0)
	{
	var lastSpeech = SpeakRepeatList[SpeakRepeatList.length-1];
	var lastAgent = lastSpeech.split(":")[0];
	if(lastAgent!=currentAgent_Speech[0])SpeakRepeatList=[];
	}
	SpeakRepeatList.push(agent_speech);
}
function loadAgent() {
			talkingheadLoaded = true;
}
function getLessonInfo() {
	var URLParams = URI.parseQuery(window.location.search);
	/*if (URLParams.talkingheadOn != undefined) {
		talkingheadOn=URLParams.talkingheadOn;
		
	}*/
talkingheadOn="true";
	  if (URLParams.UID != undefined) {
		sessionStorage.setItem("UID", URLParams.UID);
		var getParaList = URLParams.UID.split("_")
		var uname = getParaList[getParaList.length - 1];
		sessionStorage.setItem("uname", uname);

	} else {
		sessionStorage.setItem("UID", "autotutor_default_visitor");
		sessionStorage.setItem("uname", "autotutor_default_visitor");
	}
	if (URLParams.SID != undefined) {
		sessionStorage.setItem("SID", URLParams.SID);
	} else {
		sessionStorage.setItem("SID", "D1");
	}
	if (URLParams.IP != undefined) {
		sessionStorage.setItem("IP", URLParams.IP);

	} else {
		sessionStorage.setItem("IP", "null");
	}
	if (URLParams.SName != undefined) {

		sessionStorage.setItem("SName", URLParams.SName);


	} else {
		sessionStorage.setItem("SName", "User");
	}
	/*if (URLParams.talkingheadUsing != undefined) {
		talkingheadUsing=URLParams.talkingheadUsing;
		if(talkingheadUsing=="Speak2")
		{
			document.getElementById('agents').src = "angentsjs/speakTH.html";
			talkingheadLoaded = true;
		}

	}*/
	if (URLParams.LessonName != undefined) {
		getScriptFolder = URLParams.LessonName;
		var lessonStatus = setCurrentLessonInfo(getScriptFolder)
		if (lessonStatus == true) {
			GetScript(getScriptFolder);
		} else {
			alert("SYSTEM CONFIG ERROR!")
			return;
		}

	}
	 
	


}
$(document).ready(function() {
	loadAgent();
	$("#repeat").click(function() {
	if(talkingheadUsing=="Play")
	{
		 if (repeatList.length > 0) {
			repeatStatus = true;
			repeatTimes++;
			playList = playList.concat(repeatList);
			AngentPlay(playList);
			HideRepeatButton();
			HidePlayVideoButton()
		} else {
			alert("No agents speech can repeat at this page!")
		}
	
	}
	else if(talkingheadUsing=="Speak2")
	{
		repeatStatus = true;
		 repeatSpeakList();	
	}
	   

	});
	
	$("#btNext").click(function() {
	elldeSpeakRepeatList=[];
		nextButtonStatus = false;
		HideRepeatButton();
		HidePlayVideoButton()
		HideNextButton();
		var d = new Date();
		pageStartTimestamp = d.getTime();
		if(ShowButtonAndWait!=true)
		{
		 $("#mainFrame").attr("src", currentMediaUrl);
		  setProgressValue(currentMediaUrl);
		}
		else
		{
			ShowButtonAndWait=false;
		}		   
		clearTimeout(askClickNext);

	});
	$("#btReplayVideo").click(function() {
		if (replayVideo == false) {
			$(this).html("Stop Video");
			replayVideo = true;
			vidPlayerControl(videoId, replayVideo);
			HideRepeatButton();
			replayVideoTimes++;
		} else if (replayVideo == true) {
			$(this).html("Play Video");
			stopPlayVideo();
			replayVideo = false;
			vidplayerBusy = false;
			if(SpeakRepeatList.length>0)
			ShowRepeatButton();
		}
	});
	$("#readText").click(function() {
		if ($('#readTextImg').attr('src') == "images/SpeakBefore.png") {
			$("#readTextImg").attr("src", "images/SpeakAfter.png");
			document.getElementById('mainFrame').contentWindow.Lock();
			maxIdle = 1000000000;

			$("#audioPlayer2").attr("src", currentMediaPath + audioPath);
			document.getElementById('audioPlayer2').play();

		} else if ($('#readTextImg').attr('src') == "images/SpeakAfter.png") {
			$("#readTextImg").attr("src", "images/SpeakBefore.png");
			document.getElementById('mainFrame').contentWindow.Unlock();
			var mediaElement = document.getElementById("audioPlayer2");
			mediaElement.pause();
			mediaElement.src = '';
		}
	});

});
function startLesson() {
var x2 = $(window).width();
	/* if (x2 < 1400) {
		$("#containerNoImg").attr('style', " -ms-zoom: 0.8; -moz-transform: scale(0.8); -moz-transform-origin: 0px 0; -o-transform: scale(0.8); -o-transform-origin: 0 0; -webkit-transform: scale(0.8); -webkit-transform-origin: 0 0; ");
	} */
document.getElementById('mainscreen').style.display="block"; 

document.getElementById('containerNoImg').style.backgroundImage = "url(images/TabletFrame2.png)";
document.getElementById('containerNoImg').style.backgroundPosition="center top";
document.getElementById('containerNoImg').style.backgroundRepeat = "no-repeat";
document.getElementById('containerNoImg').style.display="block";

 var loadingPage = "resources/LoadingPage.html";
	$("#mainFrame").attr("src", loadingPage);
	$("#home").hide();
	$("#displayArea").hide();
	allLessonsInfoObj = getLessonsConfig()
	getLessonInfo();
}
function repeatSpeakList()
{
	if(SpeakRepeatList.length==0)return;
	agentBusy = AudioPlaying();
	
	for(var i=0; i<SpeakRepeatList.length;i++)
	{
			Speak2(SpeakRepeatList[i]);
	}
	
}
function LoadLesson(lessonID) {
	var loadingPage = "resources/LoadingPage.html";
	$("#mainFrame").attr("src", loadingPage);
	
	var retriveObj={
		guid:qs("guid",""),
		source:"ScriptOnly",
		return:"scriptContent",
		authorname:"xiangenhu",
		TagName:"SKOSCRIPTS"}
	var aurl="https://class.x-in-y.com/retrieve?json="+JSON.stringify(retriveObj);
	
	currentScripturl = scriptFolderURL + lessonID + "/ActivityMedia/Activity.xml";
	currentMediaPath = scriptFolderURL + lessonID + "/ActivityMedia/";
	setPresentationIDObj(lessonID, aurl);
//	setPresentationIDObj(lessonID, currentScripturl);

	var acePostjson = {};
	
	acePostjson.ScriptURL = aurl;
	acePostjson.User = sessionStorage.getItem("uname");
	acePostjson.UseDB = true;
	if (lessonID == "Lesson0" || lessonID == "Lesson00") {
		// acePostjson.ID = sessionStorage.getItem("GUID");
		acePostjson.ID = sessionStorage.getItem("UID");

	} else {
		acePostjson.ID = sessionStorage.getItem("UID");

	}
	replayVideoTimes = 0;
	Post(acePostjson);
	checkLessonConfig(lessonID, 1);


}

function checkLessonConfig(lessonID, progressValue) {
	currentLessonInfoObj = JSON.parse(sessionStorage.getItem("LessonInfo"));
	isHasProgressBar = currentLessonInfoObj.isHasProgressBar;
	isHasNextButton = currentLessonInfoObj.isHasNextButton;
	isHasVideo = currentLessonInfoObj.isHasVideo;
	videoId = currentLessonInfoObj.videoId;
	if (isHasProgressBar == true) {
		ShowProgressbar();
		setProgress(progressValue);

	} else {
		HideProgressbar();
	}

}

function setProgressValue(currentMediaUrl) {
	if (isHasProgressBar == true) {
		var List = currentMediaUrl.split("?");
		var pageNameList = List[0].split("/");
		var pageName = pageNameList[pageNameList.length - 1];
		for (var i in currentLessonInfoObj.pages) {

			if (currentLessonInfoObj.pages[i].questionPath == pageName) {
				var progressBarValue = currentLessonInfoObj.pages[i].progressBarValue;
				if (progressBarValue != "0") {
					setProgress(progressBarValue);
				}

			}
		}
	}

}


function speakTurn(Data,AgentNum){
	Data=Data.replace("ComputerTutor",C1);
				Data=Data.replace("ComputerStudent1",C2);
				Data=Data.replace("ComputerStudent2",C3);
				Data=Data.replace("ComputerStudent3",C4);
				Data=Data.replace("_self_",C1);
				var uname = qs("SName","John");
				Data = Data.replace("_user_",uname);
				if (AgentNum=="0"){
			        msSpeakQueued(C1,Data)
				} else{
					msSpeakQueued(C2,Data)
				}
}

function runActions() {
	agentBusy=AudioPlaying();
	if (agentBusy == true) {
		return;
	}
	if (nextButtonStatus == true) {
		return;
	}
	idleTime++;
	if (idleTime < maxIdle && mediaActions == "") {
		return;
	}
	idleTime = 0;
	maxIdle = 0;
	if (actions.length != 0) {
		var act = actions[0].Act;
		var agent = actions[0].Agent;
		var data = actions[0].Data;
		var agentNum;
		var isSpeakingSegments = false;
		console.log(actions[0]);
		if (DEBUGGING=="1"){
			$("#ActionAgent").text(agent);
			$("#ActionType").text(act);
			$("#ActionData").text(data);
		}
		if (agent != "ComputerTutor" && agent != "ComputerStudent1" && agent != "System") {
			return;
		} else if (agent == "ComputerTutor") {
			agentNum = 0;
		} else if (agent == "ComputerStudent1") {
			agentNum = 1;
		}
		switch (act) {
			case "SetValue":
				var ScoreInfo = data.split(":");
				ScoreName = ScoreInfo[0];
				Score = ScoreInfo[1];
				break;
			case "AddValue":
				var ScoreInfo = data.split(":");
				ScoreName = ScoreInfo[0];
				Score = ScoreInfo[1];
				break;
			case "ShowValue":
				var ScoreInfo = data.split(":");
				ScoreName = ScoreInfo[0];
				Score = ScoreInfo[1];

				SetScoreBoard(ScoreName, Score);

				break;
			case "Display":
				if (actions[actions.length - 1].Act == "WaitForEvent" && actions[actions.length - 1].Data >= "60") {
					var getUserName = sessionStorage.getItem("uname");
					getQuestionName = data.replace(getUserName, "_user_");
					console.log(getQuestionName);
				}
				else if (actions[actions.length - 1].Act == "WaitForEvent" && actions[actions.length - 1].Data == "30" && currentLessonID=="Lesson10") {
					var getUserName = sessionStorage.getItem("uname");
					getQuestionName = data.replace(getUserName, "_user_");
					console.log(getQuestionName);
				}

				appendTextToDisplayArea(data);


				break;
			case "Speak":
				speakTurn(data,agentNum);
				break;
			case "Play":
				if(talkingheadUsing=="Play")
				{
					playList = setPlayList(agentNum, data);
					repeatList = repeatList.concat(playList);
					AngentPlay(playList);
				}
				   

				//console.log(agentNum,data, "Play");
				break;
			case "Speak2":
//			    speakTurn(data,agentNum);
                /* 
				if(talkingheadUsing=="Speak2")
				{
					agentBusy = AudioPlaying();
					var SName = sessionStorage.getItem("SName");
					data = data.replace("_user_,", "#"+SName+"#");
					data = data.replace("_user_!", "#"+SName+"#");
					data = data.replace("_user_.", "#"+SName+"#");
					data = data.replace("_user_?", "#"+SName+"#");
					data = data.replace("_user_", "#"+SName+"#");
					var segments = data.split('#');
					data = agentNum + ":" + segments[0];
					var mergedSegments = "";
					var nseg;
					for(nseg = 1;nseg<segments.length;nseg++)
					{
						var segment = segments[nseg].trim();
						if(segment=="")continue;
						if(isPunctuation(segment) )continue;
						
						mergedSegments +=segments[nseg]+"#";
					}
					if(mergedSegments!="")
					{
					 actions[0].Data=mergedSegments;
					isSpeakingSegments = true;
					}
//					Speak2(data);
					 //SpeakRepeatList.push(data);
					 addRepeatSpeech(data);
					 
					  
				} */
				   

				//console.log(agentNum,data, "Play");
				break;
			case "SpeakLater":

				break;
			case "ShowMedia":
				if (data.includes(".html") == true) {

					showMedia(data); // Calling the showMedia function to load the HTML page in the main IFRAME
				} else if (data.includes("mp4") == true) {
					var datasplit = data.split("/");
					var vidId = datasplit[datasplit.length - 1];
					vidPlayerControl(vidId + ":2");
				}

				break;
			case "PauseAt":
				pauseAtTime = parseInt(data);
				document.getElementById('vid').contentWindow.setPauseTime(pauseAtTime);
				break;
			case "PlayNow":
				document.getElementById('vid').contentWindow.videoPlay();
				break;
			case "Wait":
				maxIdle = parseInt(data) * 10;
				waitForMediaResponse = true;
				break;

			case "WaitForEvent":

				if (data > 6) {
					repeatTimes = 0;
					if(SpeakRepeatList.length>0)
					ShowRepeatButton();
					ShowPlayVideoButton();
					document.getElementById('mainFrame').contentWindow.Unlock();
					waitForUserResponse = true;
					var d = new Date();
					talkingHeadSpeechEndTimestamp = d.getTime();					
					if (mediaActions != "") {
						mediaActions = "";
					}
					userSpendTimeCounting();
					var List = currentMediaUrl.split("?");
					var pageNameList = List[0].split("/");
					if(pageNameList[pageNameList.length-1]=="L18-MainPage.html")
					{
					waitForUserResponse = false;
					}
				}
				maxIdle = parseInt(data) * 10;

				break;

			case "WaitForInput":
				repeatTimes = 0;
				if(SpeakRepeatList.length>0)
				ShowRepeatButton();
				ShowPlayVideoButton();
				ShowTextInputDialog();
				waitForUserResponse = true;
				  var d = new Date();
					talkingHeadSpeechEndTimestamp = d.getTime();
				userSpendTimeCounting();
				maxIdle = parseInt(data) * 10;
				if (mediaActions != "") {
					mediaActions = "";
				}
				break;
			case "WaitForMediaInput":
				repeatTimes = 0;
				if(SpeakRepeatList.length>0)
				ShowRepeatButton();
				ShowPlayVideoButton();
				document.getElementById('mainFrame').contentWindow.Unlock();
				  var d = new Date();
					talkingHeadSpeechEndTimestamp = d.getTime();
				waitForUserResponse = true;
				countingSpendTime = true;
				
				userSpendTimeCounting();
				maxIdle = parseInt(data) * 10;
				if (mediaActions != "") {
					mediaActions = "";
				}
				break;

			case "WaitForNothing":
				maxIdle = 5;
				waitForUserResponse = false;
				waitForMediaResponse = false;
				break;
			case "Lock":
				document.getElementById('mainFrame').contentWindow.Lock();
				break;
			case "Unlock":
				document.getElementById('mainFrame').contentWindow.Unlock();
				break;
			case "GetMediaItem":
				document.getElementById('mainFrame').contentWindow.GetItem();
				break;
			case "ShowMediaItem":
				document.getElementById('mainFrame').contentWindow.ShowItem();
				break;
			case "ShowAudioButton":
				ShowAudioButton()
				audioPath = data;
				break;
			case "HideAudioButton":
				HideAudioButton()
				audioPath = "";
				break;
			case "GetMediaMessage":

				break;
			case "GetMediaEvent":
			waitForMediaResponse = true;		 
				InvokeScript(act, data);

				break;

			case "GetMediaFeedback":
				getMediaFeedBackData = data;
				document.getElementById('mainFrame').contentWindow.GetMediaFeedback(data);
				getMediaFeedBack = true;
				break;
			case "GetMediaSpeech":

				break;
			case "ShowMediaAnswer":
				document.getElementById('mainFrame').contentWindow.ShowMediaAnswer();
				break;

			case "End":
			if (currentLessonID == "Lesson10") 
			   {
				setProgress(100);
				}			 
				showEndingPage();
				mainpageInit2();
				InitParameters();
				break;
			case "ShowButtonAndWait":
				if(data=="NextPage")
				{
					ShowNextButton();
					
					nextButtonStatus = true;
					ShowButtonAndWait=true;
					if (currentLessonID == "Lesson9")
					{
						//document.getElementById('mainFrame').contentWindow[GetProgressBarValue]();
						InvokeScript("getProgressBarValue", "");
						//setProgress(progressValue9);
					}
				
				}
			   
				break;	  
			default:
				break;
		}
		if(!isSpeakingSegments) actions.splice(0, 1); // remove the current action except when there are more segments to speak

	} else if (actions.length == 0 && vidplayerBusy == false && PutStatus == false) {

		if (mediaActions == "" && waitForUserResponse == true) {

			return;
		}
		if (mediaActions == "" && waitForMediaResponse == true) {

			return;
		}
		var acePutjson = {};
		setPresentationHistoryObj();
		var PresentationIDObjStr = JSON.stringify(PresentationIDObj);
		var PresentationHistoryObjStr = JSON.stringify(PresentationHistoryObj);
		acePutjson.PresentationID = PresentationIDObjStr;
		acePutjson.PresentationHistory = PresentationHistoryObjStr;
		if(PresentationHistoryObj.userSelectedItem=="I'm not sure.")
		{
			mediaActions="unsure";
		}
		
		if (currentLessonID != "Lesson0") {


		   if(mediaActions=="userInputTrue")
			{
			mediaActions="";
			}
			acePutjson.ID = sessionStorage.getItem("UID");
			acePutjson.Text = userInput;
			acePutjson.Event = mediaActions;



		} else if (currentLessonID == "Lesson0" || currentLessonID != "Lesson00") {
			//acePutjson.ID = sessionStorage.getItem("GUID");
			acePutjson.ID = sessionStorage.getItem("UID");
			acePutjson.Text = userInput;
			acePutjson.Event = mediaActions;


		}
//		console.log(acePutjson);
		Put(acePutjson);
		PutStatus = true;
		StopTimer();
		mediaActions = "";
		userInput = "";
		userAnswerSpendTime = 0;
		waitForUserResponse = false;
		waitForMediaResponse = false;
		repeatList = [];
		SpeakRepeatList=[];

	}

}
var timer;

function StartTimer() {
	timer = setInterval(function() {
		runActions()
	}, 100);
}

function StopTimer() {
	clearInterval(timer);
}
function Speak2(data) {
	if(talkingheadOn=="true"){
		msSpeakQueued(C1,data);
		/* var SpeechData=data.split(":");
		if (SpeechData.length>1){
			if (SpeechData[0]=="0"){
				msSpeakQueued(C1,SpeechData[1]);
			}else{
				msSpeakQueued(C2,SpeechData[1]);
			}
		} else{
			msSpeakQueued(C1,data);
		} */
//	document.getElementById('agentsLarge').contentWindow.callBoth(data, "Speak", "on");
	}	else	{
	document.getElementById('agentsLarge').contentWindow.callBoth(data, "Speak", "off");
	}

}
function isPunctuation(ch)	{
		return ch.toLowerCase() == ch.toUpperCase();
	}
function AngentSpeak(data) {
	if (talkingheadOn == true) {
		agentBusy = AudioPlaying();
		document.getElementById('agentsLarge').contentWindow.callBoth(data, "Speak", "on");
	} else
	if (talkingheadOn == false) {
		agentBusy = true;
		document.getElementById('agentsLarge').contentWindow.callBoth(data, "Speak", "off");
	}
}
var playList;
var playListStatus = false;

function AngentPlay(playList) {
	if (talkingheadOn == true) {
		agentBusy = AudioPlaying();
		document.getElementById('agentsLarge').contentWindow.callBoth(playList[0], "Play", "on");
		playList.splice(0, 1);

		if (playList.length == 0) {
			playListStatus = false;
		} else {
			playListStatus = true;
		}

	} else if (talkingheadOn == false) {
		agentBusy =AudioPlaying();

		document.getElementById('agentsLarge').contentWindow.callBoth(playList[0], "Play", "off");
		playList.splice(0, 1);

		if (playList.length == 0) {
			playListStatus = false;
		} else {
			playListStatus = true;
		}
	}


}

function SetScoreBoard(ScoreName, Score) {
	ShowScoreBoard();
	if (ScoreName != "JordanScore") {

		var SName = sessionStorage.getItem("SName");

		$('#scoreBoardUserNameL').html(SName);
		$('#scoreL').html(Score);

	} else {

		$('#scoreBoardUserNameR').html("ComputerStudent1");
		$('#scoreR').html(Score);
	}

}

function setPlayList(agentNum, data) {
	playList = data.split(",");
	var SID = sessionStorage.getItem("SID");
	var newPlayList = [];
	var speech;
	for (var i = 0; i < playList.length; i++) {
		if (playList[i] == "_user_") {
			speech = agentNum + ":" + SID;
		} else {
			speech = agentNum + ":" + playList[i];
		}

		newPlayList.push(speech);

	}
	return newPlayList;


}

function showScriptNextButton(data) {
	var getMediaObj = currentLessonInfoObj.pages;
	var lessonID = sessionStorage.getItem("LessonID");
	var dataURL = data.toLowerCase();
	if(dataURL.indexOf("?")>0)
	dataURL = dataURL.substring(0,dataURL.indexOf("?"));
	dataURL = dataURL.replace("media/","media\\");
	if (NextButtonOn == true && isHasNextButton == true) {
		for (var i in getMediaObj) {
			if (getMediaObj[i].Type == "ReadingPage")
			{
			 var	mediaPath = "media\\" + getMediaObj[i].MediaPath;                      
				 if (mediaPath.toLowerCase() == dataURL) 
				 {
					isQuestionPageAfterFirst=false;
				 }
			}
			if (getMediaObj[i].Type == "QuestionPage") {
				var pagePath = "media\\" + getMediaObj[i].questionPath;
				//if (pagePath.toLowerCase() == data.toLowerCase()) 
				 if (pagePath.toLowerCase() == dataURL) 
				{
				if(lessonID=="Lesson8" ||  lessonID == "Lesson9" || lessonID == "Lesson10")
					{
					   $("#mainFrame").attr("src", currentMediaUrl);

						var d = new Date();
						pageStartTimestamp = d.getTime();
						 if(lessonID == "Lesson10") // ***zc: added by z cai 11/30/2018
						 {
						  setProgress(getMediaObj[i].progressBarValue);
						 }
					}
					else
					{
						if(!isQuestionPageAfterFirst)
					{
					isQuestionPageAfterFirst=true;
					skipNextButton();
					}
					else
					{
					 ShowNextButton();
						nextButtonStatus = true;
						setProgress(getMediaObj[i].progressBarValue);
						askClickNext = setTimeout(askClickNextButton, 30000);
						}
						return;
					
					}
					
				} else if (i == (getMediaObj.length - 1)) {
					$("#mainFrame").attr("src", currentMediaUrl);

					var d = new Date();
					pageStartTimestamp = d.getTime();

				}
			}

		}
	}
	else
	{
	  $("#mainFrame").attr("src", currentMediaUrl);

						var d = new Date();
						pageStartTimestamp = d.getTime();
	
	}

}				  
function showMedia(data) {
	repeatList = [];
	SpeakRepeatList=[];
	HideRepeatButton();
	HidePlayVideoButton();
	currentMediaUrl = currentMediaPath + data;
	showScriptNextButton(data);
}
function skipNextButton()
{
 nextButtonStatus = false;
		HideRepeatButton();
		HidePlayVideoButton()
		HideNextButton();
		var d = new Date();
		pageStartTimestamp = d.getTime();
		ShowButtonAndWait=false;
		
		 $("#mainFrame").attr("src", currentMediaUrl);
		  setProgressValue(currentMediaUrl);
		
}	   
var askClickNext;
function nextPage(data) {
	repeatList = [];
	SpeakRepeatList=[];
		var currentMediaUrlList1=currentMediaUrl.split("/");
	var currentMediaUrlList2=(currentMediaUrlList1[currentMediaUrlList1.length-1]).split('?');										  
	currentMediaUrl = currentMediaPath + data;
	if (NextButtonOn == true && isHasNextButton == true) {
	if(currentMediaUrlList2[0]=="L18-MainPage.html" || currentMediaUrlList2[0]=="L11Round1AMainPage.html")
	{
	
		nextButtonStatus = false;
		HideRepeatButton();
		HidePlayVideoButton()
		HideNextButton();
		var d = new Date();
		pageStartTimestamp = d.getTime();
		$("#mainFrame").attr("src", currentMediaUrl);

		//getPageName and display progress
		setProgressValue(currentMediaUrl);
	
	}
	else
	{
		showScriptNextButton(data); //modified by Cai, 10/24/2018
	 /*ShowNextButton();
		nextButtonStatus = true;

		askClickNext = setTimeout(askClickNextButton, 30000);*/
	
	}
	   

	} else {
		nextButtonStatus = false;
		HideRepeatButton();
		HidePlayVideoButton()
		HideNextButton();
		var d = new Date();
		pageStartTimestamp = d.getTime();
		$("#mainFrame").attr("src", currentMediaUrl);
	  
		//getPageName and display progress
		setProgressValue(currentMediaUrl);

	}

}
function askClickNextButton()
{
	var lessonID=sessionStorage.getItem("LessonID");
	/*if(lessonID=="Lesson1" ||lessonID=="Lesson2" ||lessonID=="Lesson4" || lessonID=="Lesson6"|| lessonID=="Lesson7"|| lessonID=="Lesson12" || lessonID=="Lesson15"|| lessonID =="Lesson17" || lessonID=="Lesson18"||lessonID=="Lesson20"|| lessonID =="Lesson21" ||lessonID == "Lesson22" || lessonID=="Lesson24"||lessonID=="Lesson25"||  lessonID=="Lesson27" || lessonID=="Lesson28"||  lessonID=="Lesson29"||lessonID=="Lesson30"||lessonID=="Lesson31" ||  lessonID=="Lesson32" || lessonID == "Lesson33" )*/
	if(lessonID!="Lesson10"&&lessonID!="Lesson11"&&lessonID!="Lesson18")
	{
		//var playList=setPlayList("0", "s1");
		// AngentPlay(playList);
		var nextButtonPrompt = "0:Please click on the next buttton to continue.";
		Speak2(nextButtonPrompt);
		 askClickNext=setTimeout(askClickNextButton, 60000);
	
	}
}
function getAgentMessage(msg)
{
	startLesson();
}

  function GetWorldEvent(msg) {
	var msgType = typeof msg;
	idleTime = 0;
	maxIdle = 0;

	if (waitForUserResponse == true) {
		endCounting();
		HideRepeatButton();
		HidePlayVideoButton();
		if (msgType == "string") {
			var n = msg.indexOf("userAnswer_");
			var n2 = msg.indexOf("userInput_");
			if (n != -1) {
				var getUserAnswer = msg.split("_");
				mediaActions = getUserAnswer[1];
				userAnswer = mediaActions;
				userSelectedItem = getUserAnswer[2];
				if (userSelectedItem == "I'm not sure.") {
					mediaActions = "unsure";
				}
			} 
			else if(n2!=-1)
			{
				var getUserAnswer = msg.split("_");
				mediaActions = getUserAnswer[1];
				userAnswer = mediaActions;
				userInput=mediaActions
				userSelectedItem = getUserAnswer[2];
				mediaActions="userInputTrue";
			   
			
			}
			else {
				mediaActions = msg;
			}

		} else if (msgType == "object") {
			userAnswer = msg.userAnswer;
			userSelectedItem = msg.userSelectedItem;
			mediaActions = msg.userAnswer;
			var lessonID = sessionStorage.getItem("LessonID");
			if (lessonID == "Lesson8") {

				getQuestionName = msg.question;
			}


		}


	} else {
		mediaActions = msg;
		var lessonID = sessionStorage.getItem("LessonID");
		if (mediaActions == mediaActions && lessonID == "Lesson8") {
			repeatList = [];

		}
		if (lessonID == "Lesson10" && msg == "Continue") {
			repeatList = [];
		}
	}
	if (repeatStatus == true) {
		repeatList = [];
		repeatStatus = false;
	}

}


function GetMediaFeedBackMsg(msg) {

	if (getMediaFeedBack == true) {

		getMediaFeedBack = false;
	}
//	var uname = sessionStorage.getItem("SName");
	var uname = qs("SName","John");
	msg = msg.replace("_user_", uname);
	SpeakRepeatList=[];
	var feedBackInfo = msg.split(':');
	var agentFeedBack = feedBackInfo[1];
	if (agentFeedBack == "Instruction" || agentFeedBack == "TAGoodAnswer") {
		Speak2("0:"+feedBackInfo[2]);
		addRepeatSpeech("0:"+feedBackInfo[2]);
		}
	else if (agentFeedBack == "SAGoodAnswer" || agentFeedBack == "SABadAnswer" || agentFeedBack == "SABadAnswer") {
		   Speak2("1:"+feedBackInfo[2]);
		   addRepeatSpeech("1:"+feedBackInfo[2]);
		}
	}

function setPresentationIDObj(lessonID, currentScripturl) {
	PresentationIDObj = {};
	PresentationIDObj.lessonID = lessonID;
	PresentationIDObj.scriptPath = currentScripturl;
	PresentationIDObj.timeStemp = setTimeStemp();
	PresentationIDObj.browser = sessionStorage.getItem("browser");
	return PresentationIDObj;

}

function setPresentationHistoryObj() {
	PresentationHistoryObj = {};
	currentMediaUrl = currentMediaUrl.replace(/\\/g, "\/");
	//every time user need to answer question, system start to count repeatTimes
	PresentationHistoryObj.repeatTimes = repeatTimes;
	PresentationHistoryObj.userAnswerSpendTime = userAnswerSpendTime;
	PresentationHistoryObj.userAnswer = userAnswer;
	PresentationHistoryObj.MediaUrl = currentMediaUrl;
	PresentationHistoryObj.userSelectedItem = userSelectedItem;
	PresentationHistoryObj.userInput = userInput;
	PresentationHistoryObj.replayVideoTimes = replayVideoTimes;
	PresentationHistoryObj.UID = sessionStorage.getItem("UID");
	PresentationHistoryObj.pageStartTimestamp = pageStartTimestamp;

	//
	var getMediaObj = currentLessonInfoObj.pages;


	var List = currentMediaUrl.split("?");
	var pageNameList = List[0].split("/");
	for (var i in getMediaObj) {

		var geMediaPath = getMediaObj[i].MediaPath;
		var getQuestionPath = getMediaObj[i].questionPath;
		var getType = getMediaObj[i].Type;
		if (getType == "ReadingPage") {
			getQuestionPath = geMediaPath;
		}
		if (getQuestionPath == pageNameList[pageNameList.length - 1]) {

			if (getMediaObj[i].quesionName != undefined) {

				var questionName1 = getMediaObj[i].quesionName.trim().toLowerCase().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
				console.log("111111-----------"+getQuestionName)
				var questionName2 = getQuestionName.trim().toLowerCase().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
				if (questionName1 == questionName2) {
					if (getType == "QuestionPage") {
						PresentationHistoryObj.Type = "QuestionPage";
						PresentationHistoryObj.questionName = getMediaObj[i].quesionName;
						PresentationHistoryObj.questionID = getMediaObj[i].questionID;
						PresentationHistoryObj.questionLevel = getMediaObj[i].questionLevel;
						PresentationHistoryObj.progressBarValue = getMediaObj[i].progressBarValue;
						 if (getMediaObj[i].notCountedItem == false && userAnswer !== "" && waitForUserResponse == true) {
						  var d = new Date();
						var userAnswerTimestamp = d.getTime();

						CountTotalScore(questionName1, userAnswer, getMediaObj[i].questionLevel,PresentationHistoryObj.userSelectedItem,PresentationHistoryObj.questionID,PresentationHistoryObj.pageStartTimestamp,talkingHeadSpeechEndTimestamp,userAnswerTimestamp,PresentationHistoryObj.userAnswerSpendTime,PresentationHistoryObj.progressBarValue);
						}
						PresentationHistoryObj.newUserPerfomaceLog = TotalScoreArr;
						console.log(getMediaObj[i].questionID);
					} else if (getType == "ReadingPage") {
						PresentationHistoryObj.Type = "ReadingPage";
						PresentationHistoryObj.lessonTextType = getMediaObj[i].lessonTextType;
						PresentationHistoryObj.MediaPath = getMediaObj[i].MediaPath;
						PresentationHistoryObj.ReadingType = getMediaObj[i].ReadingType;
						PresentationHistoryObj.TextLevel = getMediaObj[i].TextLevel;
						PresentationHistoryObj.ImagePath = getMediaObj[i].ImagePath;
						PresentationHistoryObj.TextLength = getMediaObj[i].TextLength;
					}
				}
			} else {
				if (getType == "QuestionPage") {
					PresentationHistoryObj.Type = "QuestionPage";
					PresentationHistoryObj.questionID = getMediaObj[i].questionID;
					PresentationHistoryObj.questionLevel = getMediaObj[i].questionLevel;
					PresentationHistoryObj.progressBarValue = getMediaObj[i].progressBarValue;
					PresentationHistoryObj.notCountedItem = getMediaObj[i].notCountedItem;
					PresentationHistoryObj.questionLevel = getMediaObj[i].questionLevel;
					 var d = new Date();
						var userAnswerTimestamp = d.getTime();
					if (getMediaObj[i].notCountedItem == false && userAnswer !== "" && waitForUserResponse == true) {

						CountTotalScore(getMediaObj[i].questionPath, userAnswer, getMediaObj[i].questionLevel,PresentationHistoryObj.userSelectedItem,PresentationHistoryObj.questionID,PresentationHistoryObj.pageStartTimestamp,talkingHeadSpeechEndTimestamp,userAnswerTimestamp,PresentationHistoryObj.userAnswerSpendTime,PresentationHistoryObj.progressBarValue);
					}
					PresentationHistoryObj.newUserPerfomaceLog = TotalScoreArr;

				} else if (getType == "ReadingPage") {
					PresentationHistoryObj.Type = "ReadingPage";
					PresentationHistoryObj.lessonTextType = getMediaObj[i].lessonTextType;
					PresentationHistoryObj.MediaPath = getMediaObj[i].MediaPath;
					PresentationHistoryObj.ReadingType = getMediaObj[i].ReadingType;
					PresentationHistoryObj.TextLevel = getMediaObj[i].TextLevel;
					PresentationHistoryObj.ImagePath = getMediaObj[i].ImagePath;
					PresentationHistoryObj.TextLength = getMediaObj[i].TextLength;
				}


			}

			console.log(getMediaObj[i].questionID);

		}



	}

	return PresentationHistoryObj;

}
var userAnswerSpendTime = 0

function userSpendTimeCounting() {

	userAnswerSpendTime = userAnswerSpendTime + 1
	t = setTimeout("userSpendTimeCounting()", 1000)
}

function endCounting() {
	clearTimeout(t);
	return userAnswerSpendTime;
}

function InvokeScript(funcName, funcParam) {

	if (funcParam != "") {
		document.getElementById('mainFrame').contentWindow[funcName](funcParam);
	} else {
		document.getElementById('mainFrame').contentWindow[funcName]();
	}

}

function startRecover(recoveryActions, lessonID, PresentationHistory) {
	repeatTimes = PresentationHistory.repeatTimes;
	replayVideoTimes = PresentationHistory.replayVideoTimes;
	var url = scriptFolderURL + lessonID + "/html5/index.html?lessonName=" + lessonID;
	
	var retriveObj={
		guid:qs("guid",""),
		source:"ScriptOnly",
		return:"scriptContent",
		authorname:"xiangenhu",
		TagName:"SKOSCRIPTS"}
	var aurl="https://class.x-in-y.com/retrieve?json="+JSON.stringify(retriveObj);
	
	
	currentScripturl = scriptFolderURL + lessonID + "/ActivityMedia/Activity.xml";
	
	currentScripturl = aurl;
	setPresentationIDObj(lessonID, currentScripturl)
	LoadTalkingHead(url, lessonID)
	lessonRecovery = true;
	PutStatus == false;
	currentMediaPath = scriptFolderURL + lessonID + "/ActivityMedia/";
	actions = recoveryActions;
	agentBusy = AudioPlaying();
	StartTimer();
	checkLessonConfig(lessonID, PresentationHistory.progressBarValue);
}