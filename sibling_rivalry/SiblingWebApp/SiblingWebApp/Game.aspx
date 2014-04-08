<%@ Page Title="" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Game.aspx.cs" Inherits="SiblingWebApp.Game" %>
<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
     <div>Right click and "Inspect Element".  Select the Console Tab to see the debugger output.</div>

    <canvas id="gameWorld" width="1000" height="1000" style="border: 1px solid brown; background: white"></canvas>
</asp:Content>
