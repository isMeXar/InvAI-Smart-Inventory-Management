try:
    import channels
    print(f"✅ Channels installed: {channels.__version__}")
except ImportError:
    print("❌ Channels not installed")
    print("   Run: pip install channels channels-redis")
